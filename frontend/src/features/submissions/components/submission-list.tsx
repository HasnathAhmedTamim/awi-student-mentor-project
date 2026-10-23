import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import type { Submission } from "@/types/submission";

export function SubmissionList({ submissions }: { submissions: Submission[] }) {
  return (
    <ul className="divide-y rounded-xl border">
      {submissions.map((submission) => (
        <li key={submission.id}>
          <Link
            href={`/student/submissions/${submission.id}`}
            className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{submission.projectName}</span>
                <StatusBadge status={submission.status} />
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {submission.repositoryUrl.replace("https://github.com/", "")}
              </p>
              <p className="text-xs text-muted-foreground">
                Submitted {formatDate(submission.createdAt)}
              </p>
            </div>
            <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
