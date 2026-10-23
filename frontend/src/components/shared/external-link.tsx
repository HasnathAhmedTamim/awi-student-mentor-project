import { ExternalLinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Opens user-supplied URLs safely. Anything that is not http(s) is shown as plain text. */
export function ExternalLink({
  href,
  className,
  children = href,
}: {
  href: string;
  className?: string;
  children?: React.ReactNode;
}) {
  if (!/^https?:\/\//i.test(href)) {
    return <span className={cn("break-all", className)}>{children}</span>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1 break-all font-medium underline underline-offset-4 hover:text-primary/80",
        className,
      )}
    >
      {children}
      <ExternalLinkIcon className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
