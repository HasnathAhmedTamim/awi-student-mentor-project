import { z } from "zod";
import { SubmissionStatus } from "../../generated/prisma/client.js";
import { paginationQuerySchema } from "../../utils/pagination.js";

export const listMentorSubmissionsQuerySchema = paginationQuerySchema.extend({
  status: z
    .enum(SubmissionStatus, { error: "Status must be PENDING, APPROVED or REJECTED." })
    .optional(),
});

export type ListMentorSubmissionsQuery = z.infer<typeof listMentorSubmissionsQuerySchema>;
