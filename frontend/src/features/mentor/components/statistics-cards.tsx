import { CircleCheckIcon, CircleXIcon, ClockIcon, LayersIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SubmissionStatistics } from "@/types/submission";

const CARDS = [
  { key: "total", label: "Total submissions", icon: LayersIcon },
  { key: "pending", label: "Pending", icon: ClockIcon },
  { key: "approved", label: "Approved", icon: CircleCheckIcon },
  { key: "rejected", label: "Rejected", icon: CircleXIcon },
] as const;

export function StatisticsCards({ statistics }: { statistics: SubmissionStatistics }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {CARDS.map(({ key, label, icon: Icon }) => (
        <Card key={key} className="gap-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <h3>{label}</h3>
            </CardTitle>
            <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{statistics[key]}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function StatisticsCardsSkeleton() {
  return (
    <div role="status" aria-live="polite" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <span className="sr-only">Loading statistics…</span>
      {CARDS.map(({ key }) => (
        <Skeleton key={key} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}
