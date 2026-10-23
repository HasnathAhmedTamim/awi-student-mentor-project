import Link from "next/link";
import { ExternalLink } from "@/components/shared/external-link";
import { StatusBadge } from "@/components/shared/status-badge";
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
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-4">Project</TableHead>
            <TableHead className="hidden px-4 sm:table-cell">Student</TableHead>
            <TableHead className="hidden px-4 md:table-cell">Submitted</TableHead>
            <TableHead className="px-4">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell className="max-w-72 min-w-44 px-4 py-3 whitespace-normal">
                <Link
                  href={mentorSubmissionHref(submission.id, view)}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {submission.projectName}
                </Link>
                <p className="text-xs text-muted-foreground sm:hidden">
                  by {submission.student.name}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                  <ExternalLink href={submission.repositoryUrl} className="font-normal">
                    {submission.repositoryUrl.replace("https://github.com/", "")}
                  </ExternalLink>
                  <ExternalLink href={submission.liveUrl} className="font-normal">
                    Live site
                  </ExternalLink>
                </div>
              </TableCell>
              <TableCell className="hidden px-4 py-3 sm:table-cell">
                <p>{submission.student.name}</p>
                <p className="text-xs text-muted-foreground">{submission.student.email}</p>
              </TableCell>
              <TableCell className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                {formatDate(submission.createdAt)}
              </TableCell>
              <TableCell className="px-4 py-3">
                <StatusBadge status={submission.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
