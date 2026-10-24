import { Role } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { isUniqueConstraintError } from "../../lib/prisma-errors.js";
import type { AuthUser } from "../../types/auth.js";
import { AppError } from "../../utils/app-error.js";
import { buildPaginationMeta, toSkipTake, type PaginationQuery } from "../../utils/pagination.js";
import { normalizeGithubUrl } from "./github-url.js";
import {
  submissionDetailSelect,
  submissionSelect,
  type CreateSubmissionInput,
  type SubmissionDetail,
} from "./submissions.types.js";

export async function createSubmission(studentId: string, input: CreateSubmissionInput) {
  try {
    return await prisma.submission.create({
      data: {
        studentId,
        projectName: input.projectName,
        repositoryUrl: input.repositoryUrl,
        repositoryUrlNormalized: normalizeGithubUrl(input.repositoryUrl),
        liveUrl: input.liveUrl,
        description: input.description,
      },
      select: submissionSelect,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const message = "This repository is already pending review or approved.";
      throw new AppError(409, "DUPLICATE_SUBMISSION", message, [{ field: "repositoryUrl", message }]);
    }
    throw error;
  }
}

export async function listStudentSubmissions(studentId: string, pagination: PaginationQuery) {
  const where = { studentId };
  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      select: submissionSelect,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      ...toSkipTake(pagination),
    }),
    prisma.submission.count({ where }),
  ]);

  return { submissions, meta: buildPaginationMeta(pagination, total) };
}

/**
 * Mentors can read any submission; students only their own. Another student's
 * submission is reported as not found so its existence is not revealed.
 */
export async function getSubmissionForUser(user: AuthUser, id: string): Promise<SubmissionDetail> {
  const submission = await prisma.submission.findFirst({
    where: user.role === Role.MENTOR ? { id } : { id, studentId: user.id },
    select: submissionDetailSelect,
  });

  if (!submission) {
    throw new AppError(404, "SUBMISSION_NOT_FOUND", "Submission not found.");
  }

  return submission;
}
