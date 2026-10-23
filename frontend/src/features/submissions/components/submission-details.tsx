import { ExternalLink } from "@/components/shared/external-link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import type { SubmissionDetail } from "@/types/submission";

type SubmissionDetailsProps = {
  submission: SubmissionDetail;
  showStudent?: boolean;
  /** Replaces the "waiting for review" message while the submission is pending. */
  pendingReview?: React.ReactNode;
};

export function SubmissionDetails({ submission, showStudent = false, pendingReview }: SubmissionDetailsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-xl">{submission.projectName}</CardTitle>
          <StatusBadge status={submission.status} />
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-[10rem_1fr]">
            {showStudent && (
              <>
                <dt className="text-muted-foreground">Student</dt>
                <dd>
                  {submission.student.name}
                  <span className="block break-all text-muted-foreground">{submission.student.email}</span>
                </dd>
              </>
            )}
            <dt className="text-muted-foreground">Repository</dt>
            <dd>
              <ExternalLink href={submission.repositoryUrl} />
            </dd>
            <dt className="text-muted-foreground">Live URL</dt>
            <dd>
              <ExternalLink href={submission.liveUrl} />
            </dd>
            <dt className="text-muted-foreground">Submitted</dt>
            <dd>{formatDate(submission.createdAt)}</dd>
            <dt className="text-muted-foreground">Description</dt>
            <dd className="whitespace-pre-wrap break-words">{submission.description}</dd>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {submission.status === "PENDING" ? (
            (pendingReview ?? (
              <p className="text-muted-foreground">Waiting for a mentor to review this project.</p>
            ))
          ) : (
            <div className="space-y-3">
              <p className="text-muted-foreground">
                {submission.status === "APPROVED" ? "Approved" : "Rejected"}
                {submission.reviewedBy && <> by {submission.reviewedBy.name}</>}
                {submission.reviewedAt && <> on {formatDate(submission.reviewedAt)}</>}.
              </p>
              {submission.reviewNote ? (
                <blockquote className="whitespace-pre-wrap break-words border-l-2 pl-4">
                  {submission.reviewNote}
                </blockquote>
              ) : (
                <p className="text-muted-foreground">The mentor did not leave a note.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
