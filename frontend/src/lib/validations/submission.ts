import { z } from "zod";

// Mirrors backend/src/modules/submissions/submissions.validation.ts. The backend remains the authority.
const URL_MAX_LENGTH = 300;
const GITHUB_OWNER = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
const GITHUB_REPO = /^[\w.-]{1,100}$/;

function isGithubRepositoryUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) return false;
  if (url.hostname !== "github.com" && url.hostname !== "www.github.com") return false;

  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length !== 2) return false;
  const [owner, rawRepo] = segments as [string, string];
  const repo = rawRepo.replace(/\.git$/i, "");
  return GITHUB_OWNER.test(owner) && GITHUB_REPO.test(repo) && !/^\.+$/.test(repo);
}

export const submissionSchema = z.object({
  projectName: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters.")
    .max(120, "Project name must be at most 120 characters."),
  repositoryUrl: z
    .string()
    .trim()
    .min(1, "Repository URL is required.")
    .max(URL_MAX_LENGTH, `Repository URL must be at most ${URL_MAX_LENGTH} characters.`)
    .refine(isGithubRepositoryUrl, "Enter a GitHub repository URL like https://github.com/owner/repo."),
  liveUrl: z
    .string()
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
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters.")
    .max(2000, "Description must be at most 2000 characters."),
});

export type SubmissionValues = z.infer<typeof submissionSchema>;
