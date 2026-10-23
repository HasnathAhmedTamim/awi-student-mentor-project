import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SubmissionStatus } from "@/types/submission";
import { mentorDashboardHref } from "../dashboard-href";

const FILTERS: { label: string; status?: SubmissionStatus }[] = [
  { label: "All" },
  { label: "Pending", status: "PENDING" },
  { label: "Approved", status: "APPROVED" },
  { label: "Rejected", status: "REJECTED" },
];

export function StatusFilter({ current }: { current?: SubmissionStatus }) {
  return (
    <nav aria-label="Filter submissions by status">
      <ul className="inline-flex flex-wrap gap-1 rounded-lg bg-muted p-1">
        {FILTERS.map(({ label, status }) => {
          const active = status === current;
          return (
            <li key={label}>
              <Link
                href={mentorDashboardHref({ status })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-8 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                  active && "bg-background text-foreground shadow-sm",
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
