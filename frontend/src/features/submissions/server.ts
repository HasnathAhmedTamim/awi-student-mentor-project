import "server-only";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/api-error";
import { serverApiRequest } from "@/lib/api/server";
import type { Submission, SubmissionDetail } from "@/types/submission";

export async function getMySubmissions({ page, q }: { page: number; q?: string }) {
  const query = new URLSearchParams({ page: String(page) });
  if (q) query.set("q", q);

  const { data, meta } = await serverApiRequest<{ submissions: Submission[] }>(
    `/submissions/mine?${query}`,
  );
  return { submissions: data.submissions, meta: meta! };
}

/** Calls `notFound()` for unknown ids, malformed ids and other students' submissions. */
export async function getSubmission(id: string) {
  try {
    const { data } = await serverApiRequest<{ submission: SubmissionDetail }>(
      `/submissions/${encodeURIComponent(id)}`,
    );
    return data.submission;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
}
