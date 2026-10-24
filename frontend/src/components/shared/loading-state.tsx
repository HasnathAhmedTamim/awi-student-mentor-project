import { FadeOut } from "@/components/shared/transitions";
import { Skeleton } from "@/components/ui/skeleton";

type LoadingStateProps = {
  label?: string;
  rows?: number;
};

export function LoadingState({ label = "Loading…", rows = 3 }: LoadingStateProps) {
  return (
    <FadeOut>
      <div role="status" aria-live="polite" className="space-y-3">
        <span className="sr-only">{label}</span>
        {Array.from({ length: rows }, (_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </FadeOut>
  );
}
