import { PageTransition } from "@/components/shared/transitions";
import { cn } from "@/lib/utils";

export function PageContainer({
  className,
  ...props
}: React.ComponentProps<"main">) {
  return (
    <PageTransition>
      <main
        className={cn("mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6", className)}
        {...props}
      />
    </PageTransition>
  );
}
