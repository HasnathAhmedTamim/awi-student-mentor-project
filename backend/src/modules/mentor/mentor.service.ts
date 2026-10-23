import { SubmissionStatus, type Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { isForeignKeyConstraintError } from "../../lib/prisma-errors.js";
import { AppError } from "../../utils/app-error.js";
import { buildPaginationMeta, toSkipTake } from "../../utils/pagination.js";
import { submissionDetailSelect, submissionSelect } from "../submissions/submissions.types.js";
import type { ListMentorSubmissionsQuery, ReviewSubmissionInput } from "./mentor.validation.js";

const mentorSubmissionSelect = {
  ...submissionSelect,
  student: { select: { id: true, name: true, email: true } },
} satisfies Prisma.SubmissionSelect;

export async function listSubmissions({ status, ...pagination }: ListMentorSubmissionsQuery) {
  const where: Prisma.SubmissionWhereInput = status ? { status } : {};
  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      select: mentorSubmissionSelect,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      ...toSkipTake(pagination),
    }),
    prisma.submission.count({ where }),
  ]);

  return { submissions, meta: buildPaginationMeta(pagination, total) };
}

export async function getStatistics() {
  const groups = await prisma.submission.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const countFor = (status: SubmissionStatus) =>
    groups.find((group) => group.status === status)?._count._all ?? 0;

  const pending = countFor(SubmissionStatus.PENDING);
  const approved = countFor(SubmissionStatus.APPROVED);
  const rejected = countFor(SubmissionStatus.REJECTED);

  return { total: pending + approved + rejected, pending, approved, rejected };
}

/**
 * Moves a PENDING submission to APPROVED or REJECTED. The status check is part of
 * the UPDATE's WHERE clause, so of two concurrent reviews only one can succeed.
 */
export async function reviewSubmission(
  reviewerId: string,
  id: string,
  { status, reviewNote }: ReviewSubmissionInput,
) {
  let updated: number;
  try {
    ({ count: updated } = await prisma.submission.updateMany({
      where: { id, status: SubmissionStatus.PENDING },
      data: { status, reviewNote: reviewNote ?? null, reviewedById: reviewerId, reviewedAt: new Date() },
    }));
  } catch (error) {
    // The token is still valid but the mentor's account has been deleted.
    if (isForeignKeyConstraintError(error)) {
      throw new AppError(401, "UNAUTHENTICATED", "Your account no longer exists. Please log in again.");
    }
    throw error;
  }

  const submission = await prisma.submission.findUnique({
    where: { id },
    select: submissionDetailSelect,
  });

  if (!submission) {
    throw new AppError(404, "SUBMISSION_NOT_FOUND", "Submission not found.");
  }
  if (updated === 0) {
    throw new AppError(
      409,
      "SUBMISSION_ALREADY_REVIEWED",
      `This submission has already been ${submission.status.toLowerCase()}.`,
    );
  }

  return submission;
}
