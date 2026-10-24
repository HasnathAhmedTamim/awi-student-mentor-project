import { z } from "zod";
import { paginationQuerySchema } from "../../utils/pagination.js";
import { searchParamSchema } from "../../utils/search.js";
import { toCanonicalGithubUrl } from "./github-url.js";

const URL_MAX_LENGTH = 300;

export const createSubmissionSchema = z.object({
  projectName: z
    .string({ error: "Project name is required." })
    .trim()
    .min(2, "Project name must be at least 2 characters.")
    .max(120, "Project name must be at most 120 characters."),
  repositoryUrl: z
    .string({ error: "Repository URL is required." })
    .trim()
    .min(1, "Repository URL is required.")
    .max(URL_MAX_LENGTH, `Repository URL must be at most ${URL_MAX_LENGTH} characters.`)
    .transform((value, ctx) => {
      const canonical = toCanonicalGithubUrl(value);
      if (!canonical) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a GitHub repository URL like https://github.com/owner/repo.",
        });
        return z.NEVER;
      }
      return canonical;
    }),
  liveUrl: z
    .string({ error: "Live URL is required." })
    .trim()
    .min(1, "Live URL is required.")
    .max(URL_MAX_LENGTH, `Live URL must be at most ${URL_MAX_LENGTH} characters.`)
    .pipe(
      z.url({
        protocol: /^https?$/,
        hostname: z.regexes.domain,
        error: "Enter a public http(s) URL like https://my-project.vercel.app.",
      }),
    ),
  description: z
    .string({ error: "Description is required." })
    .trim()
    .min(10, "Description must be at least 10 characters.")
    .max(2000, "Description must be at most 2000 characters."),
});

export const submissionIdParamsSchema = z.object({
  id: z.uuid("Submission id is not valid."),
});

export const listMySubmissionsQuerySchema = paginationQuerySchema.extend({ q: searchParamSchema });

export type ListMySubmissionsQuery = z.infer<typeof listMySubmissionsQuerySchema>;
