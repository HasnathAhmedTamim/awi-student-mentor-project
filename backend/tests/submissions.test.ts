import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { Role, SubmissionStatus } from "../src/generated/prisma/client.js";
import { prisma } from "../src/lib/prisma.js";
import { authCookie } from "./helpers/auth.js";
import { createSubmission, createUser, resetDatabase } from "./helpers/db.js";

const app = createApp();

const validSubmission = {
  projectName: "Portfolio Website",
  repositoryUrl: "https://github.com/Rahim/Portfolio",
  liveUrl: "https://rahim-portfolio.vercel.app",
  description: "A personal portfolio built with Next.js and Tailwind CSS.",
};

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

describe("POST /api/submissions", () => {
  it("creates a PENDING submission owned by the logged-in student", async () => {
    const student = await createUser();

    const res = await request(app)
      .post("/api/submissions")
      .set("Cookie", authCookie(student))
      .send(validSubmission);

    expect(res.status).toBe(201);
    expect(res.body.data.submission).toMatchObject({
      ...validSubmission,
      status: "PENDING",
      reviewNote: null,
      reviewedAt: null,
    });
    expect(res.body.data.submission).not.toHaveProperty("repositoryUrlNormalized");

    const stored = await prisma.submission.findUniqueOrThrow({
      where: { id: res.body.data.submission.id },
    });
    expect(stored.studentId).toBe(student.id);
    expect(stored.repositoryUrlNormalized).toBe("https://github.com/rahim/portfolio");
  });

  it("ignores studentId, status and review fields sent by the client", async () => {
    const student = await createUser();
    const otherStudent = await createUser();

    const res = await request(app)
      .post("/api/submissions")
      .set("Cookie", authCookie(student))
      .send({
        ...validSubmission,
        studentId: otherStudent.id,
        status: SubmissionStatus.APPROVED,
        reviewNote: "Self-approved",
      });

    expect(res.status).toBe(201);
    const stored = await prisma.submission.findUniqueOrThrow({
      where: { id: res.body.data.submission.id },
    });
    expect(stored).toMatchObject({
      studentId: student.id,
      status: SubmissionStatus.PENDING,
      reviewNote: null,
    });
  });

  it("stores the canonical repository URL", async () => {
    const student = await createUser();

    const res = await request(app)
      .post("/api/submissions")
      .set("Cookie", authCookie(student))
      .send({ ...validSubmission, repositoryUrl: " https://www.github.com/Rahim/Portfolio.git/ " });

    expect(res.status).toBe(201);
    expect(res.body.data.submission.repositoryUrl).toBe("https://github.com/Rahim/Portfolio");
  });

  it.each([
    "https://github.com/rahim/portfolio",
    "https://github.com/RAHIM/PORTFOLIO.git",
    "https://github.com/rahim/portfolio/?tab=readme",
  ])("rejects a duplicate repository from the same student (%s)", async (duplicateUrl) => {
    const student = await createUser();
    const cookie = authCookie(student);
    await request(app).post("/api/submissions").set("Cookie", cookie).send(validSubmission);

    const res = await request(app)
      .post("/api/submissions")
      .set("Cookie", cookie)
      .send({ ...validSubmission, repositoryUrl: duplicateUrl });

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({ code: "DUPLICATE_SUBMISSION" });
    expect(res.body.details).toEqual([
      { field: "repositoryUrl", message: "You have already submitted this repository." },
    ]);
    expect(await prisma.submission.count()).toBe(1);
  });

  it("allows only one of two concurrent duplicate submissions", async () => {
    const student = await createUser();
    const cookie = authCookie(student);

    const responses = await Promise.all(
      [1, 2].map(() =>
        request(app).post("/api/submissions").set("Cookie", cookie).send(validSubmission),
      ),
    );

    expect(responses.map((res) => res.status).sort()).toEqual([201, 409]);
    expect(await prisma.submission.count()).toBe(1);
  });

  it("lets different students submit the same repository", async () => {
    const first = await createUser();
    const second = await createUser();

    for (const student of [first, second]) {
      const res = await request(app)
        .post("/api/submissions")
        .set("Cookie", authCookie(student))
        .send(validSubmission);
      expect(res.status).toBe(201);
    }
  });

  it("returns field-level validation errors", async () => {
    const student = await createUser();

    const res = await request(app)
      .post("/api/submissions")
      .set("Cookie", authCookie(student))
      .send({
        projectName: " ",
        repositoryUrl: "https://gitlab.com/rahim/portfolio",
        liveUrl: "javascript:alert(1)",
        description: "short",
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
    const fields = res.body.details.map((detail: { field: string }) => detail.field);
    expect(fields).toEqual(
      expect.arrayContaining(["projectName", "repositoryUrl", "liveUrl", "description"]),
    );
  });

  it.each(["ftp://example.com", "https://localhost:3000", "http://127.0.0.1", "not a url"])(
    "rejects the live URL %s",
    async (liveUrl) => {
      const student = await createUser();

      const res = await request(app)
        .post("/api/submissions")
        .set("Cookie", authCookie(student))
        .send({ ...validSubmission, liveUrl });

      expect(res.status).toBe(400);
      expect(res.body.details).toEqual([expect.objectContaining({ field: "liveUrl" })]);
    },
  );

  it("rejects values longer than the column limits", async () => {
    const student = await createUser();

    const res = await request(app)
      .post("/api/submissions")
      .set("Cookie", authCookie(student))
      .send({ ...validSubmission, projectName: "a".repeat(121), description: "a".repeat(2001) });

    expect(res.status).toBe(400);
    const fields = res.body.details.map((detail: { field: string }) => detail.field);
    expect(fields).toEqual(expect.arrayContaining(["projectName", "description"]));
  });

  it("returns 401 without a session", async () => {
    const res = await request(app).post("/api/submissions").send(validSubmission);
    expect(res.status).toBe(401);
  });

  it("returns 403 for a mentor", async () => {
    const mentor = await createUser({ role: Role.MENTOR });

    const res = await request(app)
      .post("/api/submissions")
      .set("Cookie", authCookie(mentor))
      .send(validSubmission);

    expect(res.status).toBe(403);
    expect(await prisma.submission.count()).toBe(0);
  });
});

describe("GET /api/submissions/mine", () => {
  it("returns only the student's own submissions, newest first", async () => {
    const student = await createUser();
    const otherStudent = await createUser();
    await createSubmission(student.id, {
      projectName: "Older",
      createdAt: new Date("2026-01-01T00:00:00Z"),
    });
    await createSubmission(student.id, {
      projectName: "Newer",
      createdAt: new Date("2026-02-01T00:00:00Z"),
    });
    await createSubmission(otherStudent.id, { projectName: "Not mine" });

    const res = await request(app).get("/api/submissions/mine").set("Cookie", authCookie(student));

    expect(res.status).toBe(200);
    expect(res.body.data.submissions.map((s: { projectName: string }) => s.projectName)).toEqual([
      "Newer",
      "Older",
    ]);
    expect(res.body.meta).toEqual({ page: 1, limit: 10, total: 2, totalPages: 1 });
  });

  it("paginates on the server", async () => {
    const student = await createUser();
    for (let day = 1; day <= 3; day++) {
      await createSubmission(student.id, {
        projectName: `Project ${day}`,
        createdAt: new Date(`2026-01-0${day}T00:00:00Z`),
      });
    }

    const res = await request(app)
      .get("/api/submissions/mine?page=2&limit=2")
      .set("Cookie", authCookie(student));

    expect(res.status).toBe(200);
    expect(res.body.data.submissions.map((s: { projectName: string }) => s.projectName)).toEqual([
      "Project 1",
    ]);
    expect(res.body.meta).toEqual({ page: 2, limit: 2, total: 3, totalPages: 2 });
  });

  it("returns an empty list with zero pages", async () => {
    const student = await createUser();

    const res = await request(app).get("/api/submissions/mine").set("Cookie", authCookie(student));

    expect(res.body.data.submissions).toEqual([]);
    expect(res.body.meta).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
  });

  it.each(["page=0", "page=abc", "limit=51", "limit=1.5"])(
    "rejects invalid pagination (%s)",
    async (query) => {
      const student = await createUser();

      const res = await request(app)
        .get(`/api/submissions/mine?${query}`)
        .set("Cookie", authCookie(student));

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_ERROR");
    },
  );

  it("returns 403 for a mentor and 401 without a session", async () => {
    const mentor = await createUser({ role: Role.MENTOR });

    const asMentor = await request(app)
      .get("/api/submissions/mine")
      .set("Cookie", authCookie(mentor));
    const anonymous = await request(app).get("/api/submissions/mine");

    expect(asMentor.status).toBe(403);
    expect(anonymous.status).toBe(401);
  });
});

describe("GET /api/submissions/:id", () => {
  it("returns the student's own submission with student details", async () => {
    const student = await createUser({ name: "Rahim" });
    const submission = await createSubmission(student.id);

    const res = await request(app)
      .get(`/api/submissions/${submission.id}`)
      .set("Cookie", authCookie(student));

    expect(res.status).toBe(200);
    expect(res.body.data.submission).toMatchObject({
      id: submission.id,
      student: { id: student.id, name: "Rahim", email: student.email },
      reviewedBy: null,
    });
    expect(res.body.data.submission.student).not.toHaveProperty("passwordHash");
  });

  it("returns 404 for another student's submission", async () => {
    const owner = await createUser();
    const intruder = await createUser();
    const submission = await createSubmission(owner.id);

    const res = await request(app)
      .get(`/api/submissions/${submission.id}`)
      .set("Cookie", authCookie(intruder));

    expect(res.status).toBe(404);
    expect(res.body.code).toBe("SUBMISSION_NOT_FOUND");
  });

  it("lets a mentor read any submission", async () => {
    const student = await createUser();
    const mentor = await createUser({ role: Role.MENTOR });
    const submission = await createSubmission(student.id);

    const res = await request(app)
      .get(`/api/submissions/${submission.id}`)
      .set("Cookie", authCookie(mentor));

    expect(res.status).toBe(200);
    expect(res.body.data.submission.id).toBe(submission.id);
  });

  it("returns 404 for an unknown id and 400 for a malformed id", async () => {
    const student = await createUser();
    const cookie = authCookie(student);

    const unknown = await request(app)
      .get(`/api/submissions/${crypto.randomUUID()}`)
      .set("Cookie", cookie);
    const malformed = await request(app).get("/api/submissions/not-a-uuid").set("Cookie", cookie);

    expect(unknown.status).toBe(404);
    expect(malformed.status).toBe(400);
    expect(malformed.body.details).toEqual([expect.objectContaining({ field: "id" })]);
  });

  it("returns 401 without a session", async () => {
    const res = await request(app).get(`/api/submissions/${crypto.randomUUID()}`);
    expect(res.status).toBe(401);
  });
});
