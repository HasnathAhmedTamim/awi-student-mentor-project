import { z } from "zod";
import type { PaginationMeta } from "./api-response.js";

export const MAX_PAGE_SIZE = 50;

export const paginationQuerySchema = z.object({
  page: z.coerce
    .number({ error: "Page must be a number." })
    .int("Page must be a whole number.")
    .min(1, "Page must be at least 1.")
    .default(1),
  limit: z.coerce
    .number({ error: "Limit must be a number." })
    .int("Limit must be a whole number.")
    .min(1, "Limit must be at least 1.")
    .max(MAX_PAGE_SIZE, `Limit must be at most ${MAX_PAGE_SIZE}.`)
    .default(10),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export function toSkipTake({ page, limit }: PaginationQuery) {
  return { skip: (page - 1) * limit, take: limit };
}

export function buildPaginationMeta({ page, limit }: PaginationQuery, total: number): PaginationMeta {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}
