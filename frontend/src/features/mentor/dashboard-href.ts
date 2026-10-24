import type { SubmissionStatus } from "@/types/submission";

export type DashboardView = { status?: SubmissionStatus; page?: number; q?: string };

function viewQuery({ status, page = 1, q }: DashboardView) {
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (q) query.set("q", q);
  if (page > 1) query.set("page", String(page));
  const search = query.toString();
  return search ? `?${search}` : "";
}

/** Builds a mentor dashboard URL, leaving out default values so URLs stay short. */
export function mentorDashboardHref(view: DashboardView) {
  return `/mentor/dashboard${viewQuery(view)}`;
}

/** Links to a submission and remembers the dashboard view to return to. */
export function mentorSubmissionHref(id: string, view: DashboardView) {
  return `/mentor/submissions/${encodeURIComponent(id)}${viewQuery(view)}`;
}
