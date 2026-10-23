import type { SubmissionStatus } from "@/types/submission";

/** Builds a mentor dashboard URL, leaving out default values so URLs stay short. */
export function mentorDashboardHref({ status, page = 1 }: { status?: SubmissionStatus; page?: number }) {
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (page > 1) query.set("page", String(page));
  const search = query.toString();
  return search ? `/mentor/dashboard?${search}` : "/mentor/dashboard";
}
