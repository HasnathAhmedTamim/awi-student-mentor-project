import {
  CalendarDaysIcon,
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  UserRoundIcon,
} from "lucide-react";
import { ExternalLink } from "@/components/shared/external-link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SubmissionDetail } from "@/types/submission";

type SubmissionDetailsProps = {
  submission: SubmissionDetail;
  showStudent?: boolean;
  /** Mentor actions remain mounted when a review refreshes the submission status. */
  reviewActions?: React.ReactNode;
  /** Shown under the review once the submission is rejected, e.g. a link to submit again. */
  rejectedAction?: React.ReactNode;
};

const REVIEW_TONES = {
  APPROVED: { icon: CircleCheckIcon, label: "Approved", className: "border-emerald-200 bg-emerald-50 text-emerald-900" },
  REJECTED: { icon: CircleXIcon, label: "Rejected", className: "border-red-200 bg-red-50 text-red-900" },
} as const;

export function SubmissionDetails({
  submission,
  showStudent = false,
  reviewActions,
  rejectedAction,
}: SubmissionDetailsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
      <Card className="shadow-xs">
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CardTitle className="min-w-0 text-xl break-words sm:text-2xl">
              <h1>{submission.projectName}</h1>
            </CardTitle>
            <StatusBadge status={submission.status} />
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <CalendarDaysIcon className="size-4" aria-hidden="true" />
              Submitted {formatDate(submission.createdAt)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {showStudent && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <UserRoundIcon className="size-3.5" aria-hidden="true" />
                Submitted by
              </p>
              <p className="mt-1 font-medium">{submission.student.name}</p>
              <p className="break-all text-sm text-muted-foreground">{submission.student.email}</p>
            </div>
          )}
          <section aria-labelledby="submission-links-heading" className="space-y-3">
            <h2 id="submission-links-heading" className="text-sm font-semibold">
              Project links
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="min-w-0 rounded-lg border p-3">
                <p className="text-xs font-medium text-muted-foreground">GitHub repository</p>
                <div className="mt-2 min-w-0">
                  <ExternalLink href={submission.repositoryUrl} kind="repository" />
                </div>
              </div>
              <div className="min-w-0 rounded-lg border p-3">
                <p className="text-xs font-medium text-muted-foreground">Live project</p>
                <div className="mt-2 min-w-0">
                  <ExternalLink href={submission.liveUrl} kind="live" />
                </div>
              </div>
            </div>
          </section>
          <section aria-labelledby="submission-description-heading" className="space-y-2">
            <h2 id="submission-description-heading" className="text-sm font-semibold">
              Project description
            </h2>
            <p className="rounded-lg bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-wrap break-words">
              {submission.description}
            </p>
          </section>
        </CardContent>
      </Card>

      <Card className="shadow-xs xl:sticky xl:top-20">
        <CardHeader>
          <CardTitle>
            <h2>{showStudent && submission.status === "PENDING" ? "Review submission" : "Status and feedback"}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {submission.status === "PENDING" ? (
            !showStudent && (
              <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
                <ClockIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                Waiting for a mentor to review this project.
              </p>
            )
          ) : (
            <ReviewOutcome submission={submission} action={submission.status === "REJECTED" && rejectedAction} />
          )}
          {reviewActions}
        </CardContent>
      </Card>
    </div>
  );
}

function ReviewOutcome({ submission, action }: { submission: SubmissionDetail; action?: React.ReactNode }) {
  if (submission.status === "PENDING") return null;
  const { icon: Icon, label, className } = REVIEW_TONES[submission.status];
  return (
    <div className="space-y-4">
      <p className={cn("flex items-start gap-2 rounded-lg border p-3", className)}>
        <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          {label}
          {submission.reviewedBy && <> by {submission.reviewedBy.name}</>}
          {submission.reviewedAt && <> on {formatDate(submission.reviewedAt)}</>}.
        </span>
      </p>
      {submission.reviewNote ? (
        <figure className="space-y-1.5">
          <figcaption className="text-xs font-medium text-muted-foreground">
            {submission.status === "REJECTED" ? "Why this was rejected" : "Mentor feedback"}
          </figcaption>
          <blockquote className="border-l-2 border-primary/40 pl-3 leading-relaxed whitespace-pre-wrap break-words">
            {submission.reviewNote}
          </blockquote>
        </figure>
      ) : (
        <p className="text-muted-foreground">The mentor did not leave a note.</p>
      )}
      {action}
    </div>
  );
}
