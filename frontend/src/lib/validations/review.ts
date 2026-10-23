import { z } from "zod";

// Mirrors reviewSubmissionSchema in backend/src/modules/mentor/mentor.validation.ts.
export const REVIEW_NOTE_MAX_LENGTH = 500;

export const reviewSchema = z.object({
  reviewNote: z
    .string()
    .trim()
    .max(REVIEW_NOTE_MAX_LENGTH, `Review note must be at most ${REVIEW_NOTE_MAX_LENGTH} characters.`),
});

export type ReviewValues = z.infer<typeof reviewSchema>;
