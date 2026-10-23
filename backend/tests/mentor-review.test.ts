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

async function setup() {
  const student = await createUser({ name: "Student" });
  const mentor = await createUser({ name: "Mentor", role: Role.MENTOR });
  const submission = await createSubmission(student.id);
  return { student, mentor, submission };
}

function review(id: string, cookie: string | undefined, body: object) {
  const req = request(app).patch(`/api/mentor/submissions/${id}/status`);
  if (cookie) req.set("Cookie", cookie);
  return req.send(body);
}

function findSubmission(id: string) {
  return prisma.submission.findUniqueOrThrow({ where: { id } });
}

describe("PATCH /api/mentor/submissions/:id/status authorization", () => {
  it("returns 401 without a session", async () => {
    const { submission } = await setup();

    const res = await review(submission.id, undefined, { status: "APPROVED" });

    expect(res.status).toBe(401);
    expect((await findSubmission(submission.id)).status).toBe(SubmissionStatus.PENDING);
  });

  it("returns 403 for a student, even for their own submission", async () => {
    const { student, submission } = await setup();

    const res = await review(submission.id, authCookie(student), { status: "APPROVED" });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
    expect((await findSubmission(submission.id)).status).toBe(SubmissionStatus.PENDING);
  });

  it("returns 401 when the mentor's account no longer exists", async () => {
    const { mentor, submission } = await setup();
    const cookie = authCookie(mentor);
    await prisma.user.delete({ where: { id: mentor.id } });

    const res = await review(submission.id, cookie, { status: "APPROVED" });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("UNAUTHENTICATED");
    expect((await findSubmission(submission.id)).status).toBe(SubmissionStatus.PENDING);
  });
});

describe("PATCH /api/mentor/submissions/:id/status reviews", () => {
  it("approves a pending submission and records the reviewer and time", async () => {
    const { mentor, submission } = await setup();
    const before = Date.now();

    const res = await review(submission.id, authCookie(mentor), {
      status: "APPROVED",
      reviewNote: "  Great work!  ",
    });

    expect(res.status).toBe(200);
    const body = res.body.data.submission;
    expect(body).toMatchObject({
      id: submission.id,
      status: "APPROVED",
      reviewNote: "Great work!",
      reviewedBy: { id: mentor.id, name: "Mentor" },
    });
    expect(new Date(body.reviewedAt).getTime()).toBeGreaterThanOrEqual(before - 1000);
    expect(body).not.toHaveProperty("repositoryUrlNormalized");

    const stored = await findSubmission(submission.id);
    expect(stored.status).toBe(SubmissionStatus.APPROVED);
    expect(stored.reviewedById).toBe(mentor.id);
    expect(stored.reviewedAt).not.toBeNull();
  });

  it.each([
    ["omitted", {}],
    ["empty", { reviewNote: "" }],
    ["whitespace only", { reviewNote: "   " }],
  ])("rejects a submission with the review note %s stored as null", async (_label, note) => {
    const { mentor, submission } = await setup();

    const res = await review(submission.id, authCookie(mentor), { status: "REJECTED", ...note });

    expect(res.status).toBe(200);
    expect(res.body.data.submission.status).toBe("REJECTED");
    expect(res.body.data.submission.reviewNote).toBeNull();
    expect((await findSubmission(submission.id)).reviewNote).toBeNull();
  });

  it("ignores reviewer and ownership fields in the request body", async () => {
    const { mentor, submission } = await setup();
    const otherMentor = await createUser({ role: Role.MENTOR });
    const otherStudent = await createUser();

    const res = await review(submission.id, authCookie(mentor), {
      status: "APPROVED",
      reviewedById: otherMentor.id,
      studentId: otherStudent.id,
      reviewedAt: "2000-01-01T00:00:00.000Z",
    });

    expect(res.status).toBe(200);
    const stored = await findSubmission(submission.id);
    expect(stored.reviewedById).toBe(mentor.id);
    expect(stored.studentId).toBe(submission.studentId);
    expect(stored.reviewedAt!.getFullYear()).not.toBe(2000);
  });

  it("updates the statistics and is visible to the student", async () => {
    const { student, mentor, submission } = await setup();
    const cookie = authCookie(mentor);

    await review(submission.id, cookie, { status: "REJECTED", reviewNote: "Add a README." });

    const statistics = await request(app).get("/api/mentor/statistics").set("Cookie", cookie);
    expect(statistics.body.data.statistics).toEqual({
      total: 1,
      pending: 0,
      approved: 0,
      rejected: 1,
    });

    const asStudent = await request(app)
      .get(`/api/submissions/${submission.id}`)
      .set("Cookie", authCookie(student));
    expect(asStudent.body.data.submission).toMatchObject({
      status: "REJECTED",
      reviewNote: "Add a README.",
      reviewedBy: { id: mentor.id, name: "Mentor" },
    });
  });
});

describe("PATCH /api/mentor/submissions/:id/status state transitions", () => {
  it.each([SubmissionStatus.APPROVED, SubmissionStatus.REJECTED])(
    "returns 409 and changes nothing when the submission is already %s",
    async (currentStatus) => {
      const { student, mentor } = await setup();
      const reviewed = await createSubmission(student.id, { status: currentStatus });

      const res = await review(reviewed.id, authCookie(mentor), {
        status: currentStatus === "APPROVED" ? "REJECTED" : "APPROVED",
        reviewNote: "Changed my mind.",
      });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe("SUBMISSION_ALREADY_REVIEWED");
      expect(res.body.message).toBe(
        `This submission has already been ${currentStatus.toLowerCase()}.`,
      );
      const stored = await findSubmission(reviewed.id);
      expect(stored.status).toBe(currentStatus);
      expect(stored.reviewNote).toBeNull();
      expect(stored.reviewedById).toBeNull();
    },
  );

  it("returns 409 when the same review is repeated", async () => {
    const { mentor, submission } = await setup();
    const cookie = authCookie(mentor);

    const first = await review(submission.id, cookie, { status: "APPROVED" });
    const second = await review(submission.id, cookie, { status: "APPROVED" });

    expect(first.status).toBe(200);
    expect(second.status).toBe(409);
  });

  it("lets exactly one of two concurrent reviews succeed", async () => {
    const { submission } = await setup();
    const approver = await createUser({ name: "Approver", role: Role.MENTOR });
    const rejecter = await createUser({ name: "Rejecter", role: Role.MENTOR });

    const responses = await Promise.all([
      review(submission.id, authCookie(approver), { status: "APPROVED" }),
      review(submission.id, authCookie(rejecter), { status: "REJECTED" }),
    ]);

    expect(responses.map((res) => res.status).sort()).toEqual([200, 409]);
    const winner = responses.find((res) => res.status === 200)!.body.data.submission;
    const stored = await findSubmission(submission.id);
    expect(stored.status).toBe(winner.status);
    expect(stored.reviewedById).toBe(winner.reviewedBy.id);
  });
});

describe("PATCH /api/mentor/submissions/:id/status validation", () => {
  it("returns 404 for an unknown submission", async () => {
    const { mentor } = await setup();

    const res = await review(crypto.randomUUID(), authCookie(mentor), { status: "APPROVED" });

    expect(res.status).toBe(404);
    expect(res.body.code).toBe("SUBMISSION_NOT_FOUND");
  });

  it("returns 400 for a malformed submission id", async () => {
    const { mentor } = await setup();

    const res = await review("not-a-uuid", authCookie(mentor), { status: "APPROVED" });

    expect(res.status).toBe(400);
    expect(res.body.details).toEqual([{ field: "id", message: "Submission id is not valid." }]);
  });

  it.each([
    ["a missing status", {}, "status"],
    ["PENDING as the new status", { status: "PENDING" }, "status"],
    ["a lowercase status", { status: "approved" }, "status"],
    ["a review note over 500 characters", { status: "APPROVED", reviewNote: "a".repeat(501) }, "reviewNote"],
    ["a non-string review note", { status: "APPROVED", reviewNote: 42 }, "reviewNote"],
    ["a null review note", { status: "APPROVED", reviewNote: null }, "reviewNote"],
  ])("returns 400 for %s", async (_label, body, field) => {
    const { mentor, submission } = await setup();

    const res = await review(submission.id, authCookie(mentor), body);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
    expect(res.body.details.map((detail: { field: string }) => detail.field)).toEqual([field]);
    expect((await findSubmission(submission.id)).status).toBe(SubmissionStatus.PENDING);
  });

  it("accepts a review note of exactly 500 characters after trimming", async () => {
    const { mentor, submission } = await setup();

    const res = await review(submission.id, authCookie(mentor), {
      status: "APPROVED",
      reviewNote: ` ${"a".repeat(500)} `,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.submission.reviewNote).toHaveLength(500);
  });
});
