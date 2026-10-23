const OWNER_PATTERN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
const REPO_PATTERN = /^[\w.-]{1,100}$/;

/**
 * Returns the canonical `https://github.com/<owner>/<repo>` form of a repository URL,
 * or null if it is not a plain GitHub repository URL. Query strings, hashes, a trailing
 * slash and a `.git` suffix are dropped; deeper paths (`/tree/main`, `/issues`) are rejected.
 */
export function toCanonicalGithubUrl(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
  if (url.hostname !== "github.com" && url.hostname !== "www.github.com") return null;

  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length !== 2) return null;

  const [owner, rawRepo] = segments as [string, string];
  const repo = rawRepo.replace(/\.git$/i, "");
  if (!OWNER_PATTERN.test(owner) || !REPO_PATTERN.test(repo) || /^\.+$/.test(repo)) return null;

  return `https://github.com/${owner}/${repo}`;
}

/** GitHub owner and repository names are case-insensitive, so duplicates are compared in lowercase. */
export function normalizeGithubUrl(canonicalUrl: string): string {
  return canonicalUrl.toLowerCase();
}
