import { AppLink } from "@/components/shared/app-link";
import { cn } from "@/lib/utils";
import type { SubmissionStatus } from "@/types/submission";
import { mentorDashboardHref } from "../dashboard-href";

const FILTERS: { label: string; status?: SubmissionStatus }[] = [
  { label: "All" },
  { label: "Pending", status: "PENDING" },
  { label: "Approved", status: "APPROVED" },
  { label: "Rejected", status: "REJECTED" },
];

export function StatusFilter({ current, q }: { current?: SubmissionStatus; q?: string }) {
  return (
    <nav aria-label="Filter submissions by status">
      <ul className="flex flex-wrap gap-2">
        {FILTERS.map(({ label, status }) => {
          const active = status === current;
          return (
            <li key={label}>
              <AppLink
                href={mentorDashboardHref({ status, q })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-9 items-center rounded-lg border px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                  active && "border-primary bg-secondary text-secondary-foreground",
                )}
              >
                {label}
              </AppLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
