export type StudentDashboardView = { page?: number; q?: string };

function viewQuery({ page = 1, q }: StudentDashboardView) {
  const query = new URLSearchParams();
  if (q) query.set("q", q);
  if (page > 1) query.set("page", String(page));
  const search = query.toString();
  return search ? `?${search}` : "";
}

/** Builds a student dashboard URL, leaving out default values so URLs stay short. */
export function studentDashboardHref(view: StudentDashboardView) {
  return `/student/dashboard${viewQuery(view)}`;
}

/** Links to a submission and remembers the dashboard view to return to. */
export function studentSubmissionHref(id: string, view: StudentDashboardView) {
  return `/student/submissions/${encodeURIComponent(id)}${viewQuery(view)}`;
}
