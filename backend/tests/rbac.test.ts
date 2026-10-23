import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { Role } from "../src/generated/prisma/client.js";
import { authenticate } from "../src/middlewares/authenticate.js";
import { authorizeRoles } from "../src/middlewares/authorize-roles.js";
import { errorHandler } from "../src/middlewares/error-handler.js";
import { authCookie } from "./helpers/auth.js";

const app = express();
app.use(cookieParser());
app.get("/mentor-only", authenticate, authorizeRoles(Role.MENTOR), (_req, res) => {
  res.json({ success: true });
});
app.use(errorHandler);

const student = { id: crypto.randomUUID(), role: Role.STUDENT };
const mentor = { id: crypto.randomUUID(), role: Role.MENTOR };

describe("authenticate + authorizeRoles", () => {
  it("returns 401 when there is no token", async () => {
    const res = await request(app).get("/mentor-only");
    expect(res.status).toBe(401);
  });

  it("returns 403 for an authenticated student", async () => {
    const res = await request(app).get("/mentor-only").set("Cookie", authCookie(student));
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  it("allows a mentor", async () => {
    const res = await request(app).get("/mentor-only").set("Cookie", authCookie(mentor));
    expect(res.status).toBe(200);
  });

  it("does not trust a role sent by the client", async () => {
    const res = await request(app)
      .get("/mentor-only")
      .set("Cookie", authCookie(student))
      .set("X-Role", "MENTOR")
      .query({ role: "MENTOR" });
    expect(res.status).toBe(403);
  });
});
