import { Skeleton } from "@/components/ui/skeleton";

type LoadingStateProps = {
  label?: string;
  rows?: number;
};

export function LoadingState({ label = "Loading…", rows = 3 }: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}
