import "server-only";
import { serverApiRequest } from "@/lib/api/server";
import type {
  MentorSubmission,
  SubmissionStatistics,
  SubmissionStatus,
} from "@/types/submission";

export async function getStatistics() {
  const { data } = await serverApiRequest<{ statistics: SubmissionStatistics }>(
    "/mentor/statistics",
  );
  return data.statistics;
}

export async function getMentorSubmissions({
  page,
  status,
}: {
  page: number;
  status?: SubmissionStatus;
}) {
  const query = new URLSearchParams({ page: String(page) });
  if (status) query.set("status", status);

  const { data, meta } = await serverApiRequest<{ submissions: MentorSubmission[] }>(
    `/mentor/submissions?${query}`,
  );
  return { submissions: data.submissions, meta: meta! };
}
