import { z } from "zod";

export const SEARCH_MAX_LENGTH = 100;

/** Optional `?q=` search text. Blank means no search. */
export const searchParamSchema = z
  .string({ error: "Search must be text." })
  .trim()
  .max(SEARCH_MAX_LENGTH, `Search must be at most ${SEARCH_MAX_LENGTH} characters.`)
  .transform((value) => value || undefined)
  .optional();

/** Case-insensitive substring match. `%`, `_` and `\` are matched literally, not as LIKE wildcards. */
export function containsText(text: string) {
  return { contains: text.replace(/[\\%_]/g, "\\$&"), mode: "insensitive" as const };
}
