import { ChevronRightIcon, GitBranchIcon, MessageSquareTextIcon } from "lucide-react";
import { AppLink } from "@/components/shared/app-link";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import type { Submission } from "@/types/submission";
import { type StudentDashboardView, studentSubmissionHref } from "../dashboard-href";

export function SubmissionList({
  submissions,
  view,
}: {
  submissions: Submission[];
  view: StudentDashboardView;
}) {
  return (
    <ul className="space-y-3">
      {submissions.map((submission) => (
        <li key={submission.id}>
          <AppLink
            href={studentSubmissionHref(submission.id, view)}
            className="group flex items-center gap-4 rounded-lg border bg-card p-4 shadow-xs transition-colors hover:bg-muted/30 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{submission.projectName}</span>
                <StatusBadge status={submission.status} />
              </div>
              <p className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
                <GitBranchIcon className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{submission.repositoryUrl.replace("https://github.com/", "")}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Submitted {formatDate(submission.createdAt)}
                {submission.reviewedAt && <> · Reviewed {formatDate(submission.reviewedAt)}</>}
              </p>
              {submission.reviewNote && (
                <p className="flex items-start gap-1.5 text-sm text-foreground/80">
                  <MessageSquareTextIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="line-clamp-1">
                    <span className="sr-only">Mentor&apos;s note: </span>
                    {submission.reviewNote}
                  </span>
                </p>
              )}
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
              View details
              <ChevronRightIcon
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </AppLink>
        </li>
      ))}
    </ul>
  );
}
