"use client";

import { AppLink } from "@/components/shared/app-link";
import { ExternalLink } from "@/components/shared/external-link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";
import type { MentorSubmission } from "@/types/submission";

export function MentorSubmissionPreview({
  submission,
  detailsHref,
}: {
  submission: MentorSubmission;
  detailsHref: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={`Preview ${submission.projectName}`}
        >
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="break-words">{submission.projectName}</DialogTitle>
            <StatusBadge status={submission.status} />
          </div>
          <DialogDescription>
            Submitted {formatDate(submission.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <section aria-labelledby={`preview-student-${submission.id}`} className="rounded-lg border p-3">
          <h3 id={`preview-student-${submission.id}`} className="text-sm font-medium">
            Student
          </h3>
          <p className="mt-1 text-sm">{submission.student.name}</p>
          <p className="break-all text-sm text-muted-foreground">{submission.student.email}</p>
        </section>

        <section aria-labelledby={`preview-description-${submission.id}`} className="space-y-2">
          <h3 id={`preview-description-${submission.id}`} className="text-sm font-medium">
            Project description
          </h3>
          <p className="max-h-40 overflow-y-auto rounded-lg border bg-muted/30 p-3 text-sm leading-relaxed whitespace-pre-wrap break-words">
            {submission.description}
          </p>
        </section>

        {submission.reviewNote && (
          <section aria-labelledby={`preview-feedback-${submission.id}`} className="space-y-2">
            <h3 id={`preview-feedback-${submission.id}`} className="text-sm font-medium">
              Mentor feedback
            </h3>
            <p className="rounded-lg border bg-muted/30 p-3 text-sm leading-relaxed whitespace-pre-wrap break-words">
              {submission.reviewNote}
            </p>
          </section>
        )}

        <dl className="grid gap-3 text-sm sm:grid-cols-[7rem_1fr]">
          <dt className="font-medium">GitHub repository</dt>
          <dd className="min-w-0">
            <ExternalLink href={submission.repositoryUrl} kind="repository" />
          </dd>
          <dt className="font-medium">Live project</dt>
          <dd className="min-w-0">
            <ExternalLink href={submission.liveUrl} kind="live" />
          </dd>
        </dl>

        <DialogFooter>
          <Button asChild>
            <AppLink href={detailsHref}>
              {submission.status === "PENDING" ? "Open full review" : "View full details"}
            </AppLink>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
