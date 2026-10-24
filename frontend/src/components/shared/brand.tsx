import { ClipboardCheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ className, nameClassName }: { className?: string; nameClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <ClipboardCheckIcon className="size-4" aria-hidden="true" />
      </span>
      <span className={nameClassName}>Project Review</span>
    </span>
  );
}
