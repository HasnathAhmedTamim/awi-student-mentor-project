import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { AppLink } from "@/components/shared/app-link";
import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/types/api";

type PaginationControlsProps = {
  meta: PaginationMeta;
  hrefForPage: (page: number) => string;
};

export function PaginationControls({ meta, hrefForPage }: PaginationControlsProps) {
  const { page, limit, total, totalPages } = meta;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between"
    >
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {totalPages <= 1 ? (
          `${total} submission${total === 1 ? "" : "s"}`
        ) : (
          <>
            Showing <span className="font-medium text-foreground">{from}–{to}</span> of{" "}
            <span className="font-medium text-foreground">{total}</span>
          </>
        )}
      </p>
      {totalPages > 1 && (
        <ul className="flex items-center gap-1">
          <li>
            <PageLink href={page > 1 ? hrefForPage(page - 1) : undefined} label="Previous page">
              <ChevronLeftIcon aria-hidden="true" />
              Previous
            </PageLink>
          </li>
          <li className="px-2 text-sm text-muted-foreground sm:hidden">
            Page {page} of {totalPages}
          </li>
          {pageItems(page, totalPages).map((item, index) =>
            item === "gap" ? (
              <li key={`gap-${index}`} className="hidden px-1 text-muted-foreground sm:block" aria-hidden="true">
                …
              </li>
            ) : (
              <li key={item} className="hidden sm:block">
                <PageLink
                  href={hrefForPage(item)}
                  label={`Page ${item}`}
                  current={item === page}
                  className="min-w-8 px-0"
                >
                  {item}
                </PageLink>
              </li>
            ),
          )}
          <li>
            <PageLink href={page < totalPages ? hrefForPage(page + 1) : undefined} label="Next page">
              Next
              <ChevronRightIcon aria-hidden="true" />
            </PageLink>
          </li>
        </ul>
      )}
    </nav>
  );
}

/** The first, last, current and neighbouring pages, with "gap" where pages are skipped. */
function pageItems(page: number, totalPages: number): (number | "gap")[] {
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((candidate) => candidate >= 1 && candidate <= totalPages)
    .sort((a, b) => a - b);

  return pages.flatMap((current, index) => {
    const previous = pages[index - 1];
    if (previous === undefined || current - previous === 1) return [current];
    return current - previous === 2 ? [previous + 1, current] : ["gap" as const, current];
  });
}

function PageLink({
  href,
  label,
  current = false,
  className,
  children,
}: {
  href: string | undefined;
  label: string;
  current?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  if (!href) {
    return (
      <Button variant="outline" size="sm" disabled aria-label={label} className={className}>
        {children}
      </Button>
    );
  }
  return (
    <Button asChild variant={current ? "default" : "outline"} size="sm" className={className}>
      <AppLink href={href} aria-label={label} aria-current={current ? "page" : undefined}>
        {children}
      </AppLink>
    </Button>
  );
}
