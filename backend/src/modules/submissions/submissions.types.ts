import type { z } from "zod";
import type { Prisma } from "../../generated/prisma/client.js";
import type { createSubmissionSchema } from "./submissions.validation.js";

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;

/** Fields returned to clients. `repositoryUrlNormalized` is an internal duplicate key. */
export const submissionSelect = {
  id: true,
  projectName: true,
  repositoryUrl: true,
  liveUrl: true,
  description: true,
  status: true,
  reviewNote: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SubmissionSelect;

export const submissionDetailSelect = {
  ...submissionSelect,
  student: { select: { id: true, name: true, email: true } },
  reviewedBy: { select: { id: true, name: true } },
} satisfies Prisma.SubmissionSelect;

export type SubmissionSummary = Prisma.SubmissionGetPayload<{ select: typeof submissionSelect }>;
export type SubmissionDetail = Prisma.SubmissionGetPayload<{
  select: typeof submissionDetailSelect;
}>;
