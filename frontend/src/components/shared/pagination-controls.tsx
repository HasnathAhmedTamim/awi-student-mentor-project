import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
};

export function PaginationControls({ page, totalPages, hrefForPage }: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <PageLink href={page > 1 ? hrefForPage(page - 1) : undefined} label="Previous">
          <ChevronLeftIcon aria-hidden="true" />
          Previous
        </PageLink>
        <PageLink href={page < totalPages ? hrefForPage(page + 1) : undefined} label="Next">
          Next
          <ChevronRightIcon aria-hidden="true" />
        </PageLink>
      </div>
    </nav>
  );
}

function PageLink({
  href,
  label,
  children,
}: {
  href: string | undefined;
  label: string;
  children: React.ReactNode;
}) {
  if (!href) {
    return (
      <Button variant="outline" size="sm" disabled aria-label={`${label} page`}>
        {children}
      </Button>
    );
  }
  return (
    <Button asChild variant="outline" size="sm">
      <Link href={href} aria-label={`${label} page`}>
        {children}
      </Link>
    </Button>
  );
}
