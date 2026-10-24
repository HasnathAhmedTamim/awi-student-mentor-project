import { ExternalLinkIcon, GitBranchIcon, GlobeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Opens user-supplied URLs safely. Anything that is not http(s) is shown as plain text. */
export function ExternalLink({
  href,
  className,
  children,
  kind,
  iconOnly = false,
  ariaLabel,
}: {
  href: string;
  className?: string;
  children?: React.ReactNode;
  kind?: "repository" | "live";
  iconOnly?: boolean;
  ariaLabel?: string;
}) {
  if (!/^https?:\/\//i.test(href)) {
    return <span className={cn("break-all", className)}>{children ?? href}</span>;
  }

  const isRepository = kind === "repository" || (!kind && new URL(href).hostname === "github.com");
  const Icon = isRepository ? GitBranchIcon : GlobeIcon;
  const label =
    children ??
    (isRepository
      ? new URL(href).pathname.replace(/^\/|\/$/g, "")
      : kind === "live"
        ? "Live site"
        : new URL(href).hostname);

  if (iconOnly) {
    const accessibleLabel =
      ariaLabel ?? (isRepository ? "Open GitHub repository" : "Open live project");
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={accessibleLabel}
        title={accessibleLabel}
        className={cn(
          "inline-flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className,
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={href}
      className={cn(
        "inline-flex min-w-0 max-w-full items-center gap-1.5 font-medium text-primary underline underline-offset-4 hover:text-primary/80",
        className,
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 truncate">{label}</span>
      <ExternalLinkIcon className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
