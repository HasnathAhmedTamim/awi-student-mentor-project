import { CircleCheckIcon, CircleXIcon, ClockIcon, LayersIcon } from "lucide-react";
import { FadeOut } from "@/components/shared/transitions";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { SubmissionStatistics } from "@/types/submission";

const CARDS = [
  { key: "total", label: "Total submissions", icon: LayersIcon, tone: "bg-secondary text-secondary-foreground" },
  { key: "pending", label: "Pending", icon: ClockIcon, tone: "bg-amber-100 text-amber-700" },
  {
    key: "approved",
    label: "Approved",
    icon: CircleCheckIcon,
    tone: "bg-emerald-100 text-emerald-700",
  },
  { key: "rejected", label: "Rejected", icon: CircleXIcon, tone: "bg-red-100 text-red-700" },
] as const satisfies readonly {
  key: keyof SubmissionStatistics;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}[];

export function StatisticsCards({ statistics }: { statistics: SubmissionStatistics }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <li key={card.key}>
            <div className="rounded-lg border bg-card p-3 shadow-xs sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-muted-foreground">{card.label}</h3>
                <span className={cn("grid size-8 place-items-center rounded-lg", card.tone)}>
                  <Icon className="size-4" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-semibold tabular-nums">{statistics[card.key]}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function StatisticsCardsSkeleton() {
  return (
    <FadeOut>
      <div role="status" aria-live="polite" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <span className="sr-only">Loading statistics…</span>
        {CARDS.map(({ key }) => (
          <Skeleton key={key} className="h-[6.5rem] rounded-xl" />
        ))}
      </div>
    </FadeOut>
  );
}
