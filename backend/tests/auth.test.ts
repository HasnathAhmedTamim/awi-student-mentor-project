import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { AUTH_COOKIE_NAME } from "../src/config/cookie.js";
import { env } from "../src/config/env.js";
import { Role } from "../src/generated/prisma/client.js";
import { prisma } from "../src/lib/prisma.js";
import { authCookie } from "./helpers/auth.js";
import { createUser, resetDatabase, TEST_PASSWORD } from "./helpers/db.js";

const app = createApp();

const validSignup = {
  name: "Rahim Uddin",
  email: "Rahim@Example.com",
  password: "Password123",
};

function getAuthCookie(res: request.Response) {
  const cookies = ([] as string[]).concat(res.headers["set-cookie"] ?? []);
  return cookies.find((cookie) => cookie.startsWith(`${AUTH_COOKIE_NAME}=`));
}

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

describe("POST /api/auth/signup", () => {
  it("creates a student, sets an HttpOnly cookie and never returns the password hash", async () => {
    const res = await request(app).post("/api/auth/signup").send(validSignup);

    expect(res.status).toBe(201);
    expect(res.body.data.user).toMatchObject({
      name: "Rahim Uddin",
      email: "rahim@example.com",
      role: "STUDENT",
    });
    expect(res.body.data.user).not.toHaveProperty("passwordHash");

    const cookie = getAuthCookie(res);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
  });

  it("ignores a role in the payload and always creates a STUDENT", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ ...validSignup, role: "MENTOR" });

    expect(res.status).toBe(201);
    const stored = await prisma.user.findUniqueOrThrow({ where: { email: "rahim@example.com" } });
    expect(stored.role).toBe(Role.STUDENT);
  });

  it("rejects a duplicate email regardless of letter case", async () => {
    await request(app).post("/api/auth/signup").send(validSignup);
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ ...validSignup, email: "RAHIM@example.COM" });

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({ success: false, code: "EMAIL_TAKEN" });
  });

  it("returns field-level validation errors", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "A", email: "not-an-email", password: "short" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
    const fields = res.body.details.map((detail: { field: string }) => detail.field);
    expect(fields).toEqual(expect.arrayContaining(["name", "email", "password"]));
  });
});

describe("POST /api/auth/login", () => {
  it("logs in with valid credentials and the cookie works for /me", async () => {
    await createUser({ email: "student@example.com" });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "Student@Example.com", password: TEST_PASSWORD });

    expect(login.status).toBe(200);
    const cookie = getAuthCookie(login);
    expect(cookie).toBeDefined();

    const me = await request(app).get("/api/auth/me").set("Cookie", cookie!.split(";")[0]!);
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe("student@example.com");
  });

  it("returns the same 401 for a wrong password and an unknown email", async () => {
    await createUser({ email: "student@example.com" });

    const wrongPassword = await request(app)
      .post("/api/auth/login")
      .send({ email: "student@example.com", password: "WrongPass1" });
    const unknownEmail = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "WrongPass1" });

    for (const res of [wrongPassword, unknownEmail]) {
      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ code: "INVALID_CREDENTIALS" });
      expect(getAuthCookie(res)).toBeUndefined();
    }
    expect(wrongPassword.body.message).toBe(unknownEmail.body.message);
  });
});

describe("GET /api/auth/me", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("UNAUTHENTICATED");
  });

  it("rejects a malformed token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", `${AUTH_COOKIE_NAME}=not-a-jwt`);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("INVALID_TOKEN");
  });

  it("rejects a token signed with a different secret", async () => {
    const user = await createUser();
    const forged = jwt.sign({ role: "MENTOR" }, "some-other-secret-that-is-long-enough", {
      subject: user.id,
    });
    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", `${AUTH_COOKIE_NAME}=${forged}`);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("INVALID_TOKEN");
  });

  it("rejects an unsigned (alg: none) token", async () => {
    const user = await createUser();
    const unsigned = jwt.sign({ role: "MENTOR" }, "", {
      subject: user.id,
      algorithm: "none",
    });
    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", `${AUTH_COOKIE_NAME}=${unsigned}`);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("INVALID_TOKEN");
  });

  it("reports an expired token", async () => {
    const user = await createUser();
    const expired = jwt.sign(
      { role: user.role, exp: Math.floor(Date.now() / 1000) - 60 },
      env.JWT_SECRET,
      { subject: user.id },
    );
    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", `${AUTH_COOKIE_NAME}=${expired}`);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("TOKEN_EXPIRED");
  });

  it("returns 401 when the user behind a valid token no longer exists", async () => {
    const user = await createUser();
    const cookie = authCookie(user);
    await prisma.user.delete({ where: { id: user.id } });

    const res = await request(app).get("/api/auth/me").set("Cookie", cookie);
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/logout", () => {
  it("clears the auth cookie", async () => {
    const res = await request(app).post("/api/auth/logout");

    expect(res.status).toBe(200);
    const cookie = getAuthCookie(res);
    expect(cookie).toMatch(/Expires=Thu, 01 Jan 1970/);
  });
});
