import { z } from "zod";
import { SubmissionStatus } from "../../generated/prisma/client.js";
import { paginationQuerySchema } from "../../utils/pagination.js";

export const listMentorSubmissionsQuerySchema = paginationQuerySchema.extend({
  status: z
    .enum(SubmissionStatus, { error: "Status must be PENDING, APPROVED or REJECTED." })
    .optional(),
});

export type ListMentorSubmissionsQuery = z.infer<typeof listMentorSubmissionsQuerySchema>;

const REVIEW_NOTE_MAX_LENGTH = 500;

export const reviewSubmissionSchema = z.object({
  status: z.enum([SubmissionStatus.APPROVED, SubmissionStatus.REJECTED], {
    error: "Status must be APPROVED or REJECTED.",
  }),
  reviewNote: z
    .string({ error: "Review note must be text." })
    .trim()
    .max(REVIEW_NOTE_MAX_LENGTH, `Review note must be at most ${REVIEW_NOTE_MAX_LENGTH} characters.`)
    .transform((note) => note || null)
    .optional(),
});

export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>;
