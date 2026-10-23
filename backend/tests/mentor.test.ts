import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { Role, SubmissionStatus } from "../src/generated/prisma/client.js";
import { prisma } from "../src/lib/prisma.js";
import { authCookie } from "./helpers/auth.js";
import { createSubmission, createUser, resetDatabase } from "./helpers/db.js";

const app = createApp();

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

async function createMentorCookie() {
  return authCookie(await createUser({ role: Role.MENTOR }));
}

async function seedSubmissions() {
  const first = await createUser({ name: "First Student" });
  const second = await createUser({ name: "Second Student" });
  const statuses = [
    [first, SubmissionStatus.PENDING, "2026-01-01"],
    [first, SubmissionStatus.APPROVED, "2026-01-02"],
    [second, SubmissionStatus.PENDING, "2026-01-03"],
    [second, SubmissionStatus.REJECTED, "2026-01-04"],
    [second, SubmissionStatus.PENDING, "2026-01-05"],
  ] as const;

  for (const [student, status, date] of statuses) {
    await createSubmission(student.id, {
      status,
      projectName: `${status} ${date}`,
      createdAt: new Date(`${date}T00:00:00Z`),
    });
  }
}

describe("mentor route protection", () => {
  it.each(["/api/mentor/submissions", "/api/mentor/statistics"])(
    "returns 401 without a session and 403 for a student (%s)",
    async (path) => {
      const student = await createUser();

      const anonymous = await request(app).get(path);
      const asStudent = await request(app).get(path).set("Cookie", authCookie(student));

      expect(anonymous.status).toBe(401);
      expect(asStudent.status).toBe(403);
      expect(asStudent.body.code).toBe("FORBIDDEN");
    },
  );
});

describe("GET /api/mentor/statistics", () => {
  it("counts submissions by status from the database", async () => {
    await seedSubmissions();

    const res = await request(app)
      .get("/api/mentor/statistics")
      .set("Cookie", await createMentorCookie());

    expect(res.status).toBe(200);
    expect(res.body.data.statistics).toEqual({ total: 5, pending: 3, approved: 1, rejected: 1 });
  });

  it("returns zeros when there are no submissions", async () => {
    const res = await request(app)
      .get("/api/mentor/statistics")
      .set("Cookie", await createMentorCookie());

    expect(res.body.data.statistics).toEqual({ total: 0, pending: 0, approved: 0, rejected: 0 });
  });
});

describe("GET /api/mentor/submissions", () => {
  it("lists all students' submissions newest first with safe student details", async () => {
    await seedSubmissions();

    const res = await request(app)
      .get("/api/mentor/submissions")
      .set("Cookie", await createMentorCookie());

    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual({ page: 1, limit: 10, total: 5, totalPages: 1 });
    expect(res.body.data.submissions.map((s: { createdAt: string }) => s.createdAt)).toEqual([
      "2026-01-05T00:00:00.000Z",
      "2026-01-04T00:00:00.000Z",
      "2026-01-03T00:00:00.000Z",
      "2026-01-02T00:00:00.000Z",
      "2026-01-01T00:00:00.000Z",
    ]);

    const [latest] = res.body.data.submissions;
    expect(Object.keys(latest.student).sort()).toEqual(["email", "id", "name"]);
    expect(latest.student.name).toBe("Second Student");
    expect(latest).not.toHaveProperty("repositoryUrlNormalized");
  });

  it("filters by status on the server", async () => {
    await seedSubmissions();
    const cookie = await createMentorCookie();

    const pending = await request(app)
      .get("/api/mentor/submissions?status=PENDING")
      .set("Cookie", cookie);
    const rejected = await request(app)
      .get("/api/mentor/submissions?status=REJECTED")
      .set("Cookie", cookie);

    expect(pending.body.meta.total).toBe(3);
    expect(
      pending.body.data.submissions.every((s: { status: string }) => s.status === "PENDING"),
    ).toBe(true);
    expect(rejected.body.data.submissions).toHaveLength(1);
    expect(rejected.body.data.submissions[0].status).toBe("REJECTED");
  });

  it("combines the status filter with pagination", async () => {
    await seedSubmissions();

    const res = await request(app)
      .get("/api/mentor/submissions?status=PENDING&page=2&limit=2")
      .set("Cookie", await createMentorCookie());

    expect(res.status).toBe(200);
    expect(res.body.data.submissions.map((s: { projectName: string }) => s.projectName)).toEqual([
      "PENDING 2026-01-01",
    ]);
    expect(res.body.meta).toEqual({ page: 2, limit: 2, total: 3, totalPages: 2 });
  });

  it("returns an empty page past the last page", async () => {
    await seedSubmissions();

    const res = await request(app)
      .get("/api/mentor/submissions?page=9")
      .set("Cookie", await createMentorCookie());

    expect(res.status).toBe(200);
    expect(res.body.data.submissions).toEqual([]);
    expect(res.body.meta).toEqual({ page: 9, limit: 10, total: 5, totalPages: 1 });
  });

  it.each(["status=pending", "status=ALL", "status=", "page=0", "limit=100"])(
    "rejects invalid query parameters (%s)",
    async (query) => {
      const res = await request(app)
        .get(`/api/mentor/submissions?${query}`)
        .set("Cookie", await createMentorCookie());

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_ERROR");
    },
  );
});
