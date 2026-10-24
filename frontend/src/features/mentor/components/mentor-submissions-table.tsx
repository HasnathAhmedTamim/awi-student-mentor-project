import { ChevronRightIcon } from "lucide-react";
import { AppLink } from "@/components/shared/app-link";
import { ExternalLink } from "@/components/shared/external-link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { MentorSubmissionPreview } from "@/features/mentor/components/mentor-submission-preview";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type DashboardView, mentorSubmissionHref } from "@/features/mentor/dashboard-href";
import { formatDate } from "@/lib/format";
import type { MentorSubmission } from "@/types/submission";

export function MentorSubmissionsTable({
  submissions,
  view,
}: {
  submissions: MentorSubmission[];
  view: DashboardView;
}) {
  return (
    <>
      <ul className="grid gap-3 xl:hidden">
        {submissions.map((submission) => {
          const href = mentorSubmissionHref(submission.id, view);
          const pending = submission.status === "PENDING";
          return (
            <li key={submission.id} className="min-w-0 rounded-lg border bg-card p-4 shadow-xs">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <AppLink href={href} className="min-w-0 font-medium underline-offset-4 hover:underline">
                  <span className="block break-words">{submission.projectName}</span>
                </AppLink>
                <StatusBadge status={submission.status} />
              </div>
              <StudentIdentity name={submission.student.name} email={submission.student.email} />
              <div className="mt-3 flex items-center gap-2">
                <ExternalLink
                  href={submission.repositoryUrl}
                  kind="repository"
                  iconOnly
                  ariaLabel={`Open ${submission.projectName} GitHub repository`}
                />
                <ExternalLink
                  href={submission.liveUrl}
                  kind="live"
                  iconOnly
                  ariaLabel={`Open ${submission.projectName} live project`}
                />
                <span className="text-xs text-muted-foreground">Project links</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Submitted {formatDate(submission.createdAt)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <MentorSubmissionPreview submission={submission} detailsHref={href} />
                <Button asChild size="sm" variant={pending ? "default" : "outline"}>
                  <AppLink href={href}>{pending ? "Review submission" : "View details"}</AppLink>
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="hidden overflow-hidden rounded-lg border bg-card shadow-xs xl:block">
      <Table className="table-fixed">
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[38%] px-4">Project</TableHead>
            <TableHead className="hidden px-4 sm:table-cell">Student</TableHead>
            <TableHead className="hidden px-4 xl:table-cell">Submitted</TableHead>
            <TableHead className="w-28 px-4">Status</TableHead>
            <TableHead className="w-64 px-4">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => {
            const href = mentorSubmissionHref(submission.id, view);
            const pending = submission.status === "PENDING";
            return (
              <TableRow key={submission.id}>
                <TableCell className="max-w-72 min-w-0 px-4 py-3 whitespace-normal">
                  <AppLink href={href} className="font-medium underline-offset-4 hover:underline">
                    {submission.projectName}
                  </AppLink>
                  <div className="mt-2 flex items-center gap-2">
                    <ExternalLink
                      href={submission.repositoryUrl}
                      kind="repository"
                      iconOnly
                      ariaLabel={`Open ${submission.projectName} GitHub repository`}
                    />
                    <ExternalLink
                      href={submission.liveUrl}
                      kind="live"
                      iconOnly
                      ariaLabel={`Open ${submission.projectName} live project`}
                    />
                  </div>
                </TableCell>
                <TableCell className="hidden min-w-0 px-4 py-3 sm:table-cell">
                  <StudentIdentity name={submission.student.name} email={submission.student.email} />
                </TableCell>
                <TableCell className="hidden px-4 py-3 text-muted-foreground xl:table-cell">
                  {formatDate(submission.createdAt)}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <StatusBadge status={submission.status} />
                </TableCell>
                <TableCell className="px-2 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <MentorSubmissionPreview submission={submission} detailsHref={href} />
                    <Button asChild size="sm" variant={pending ? "default" : "ghost"}>
                      <AppLink href={href}>
                        {pending ? "Review" : "Details"}
                        <span className="sr-only"> {submission.projectName}</span>
                        <ChevronRightIcon aria-hidden="true" />
                      </AppLink>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </div>
    </>
  );
}

function StudentIdentity({ name, email }: { name: string; email: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden="true"
        className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
      >
        {initials}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium" title={name}>{name}</p>
        <p className="truncate text-xs text-muted-foreground" title={email}>{email}</p>
      </div>
    </div>
  );
}
