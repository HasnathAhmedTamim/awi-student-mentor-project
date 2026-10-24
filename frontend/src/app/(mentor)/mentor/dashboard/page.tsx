import type { Metadata } from "next";
import { Suspense } from "react";
import { AppLink } from "@/components/shared/app-link";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SearchBox } from "@/components/shared/search-box";
import { Reveal } from "@/components/shared/transitions";
import { Button } from "@/components/ui/button";
import { MentorSubmissionsTable } from "@/features/mentor/components/mentor-submissions-table";
import {
  StatisticsCards,
  StatisticsCardsSkeleton,
} from "@/features/mentor/components/statistics-cards";
import { StatusFilter } from "@/features/mentor/components/status-filter";
import { mentorDashboardHref } from "@/features/mentor/dashboard-href";
import { getMentorSubmissions, getStatistics } from "@/features/mentor/server";
import { requireRole } from "@/lib/auth/session";
import { parsePageParam, parseSearchParam, parseStatusParam } from "@/lib/search-params";
import type { SubmissionStatus } from "@/types/submission";

export const metadata: Metadata = { title: "Mentor dashboard" };
export const instant = false;

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export default async function MentorDashboardPage({
  searchParams,
}: PageProps<"/mentor/dashboard">) {
  await requireRole("MENTOR");
  const params = await searchParams;
  const page = parsePageParam(params.page);
  const status = parseStatusParam(params.status);
  const q = parseSearchParam(params.q);

  return (
    <PageContainer className="space-y-8">
      <PageHeader title="Project Review" description="Review and manage student project submissions." />

      <section aria-labelledby="statistics-heading">
        <h2 id="statistics-heading" className="sr-only">
          Statistics
        </h2>
        <Suspense fallback={<StatisticsCardsSkeleton />}>
          <Reveal>
            <Statistics />
          </Reveal>
        </Suspense>
        <p className="mt-3 text-sm text-muted-foreground">
          Counts include all submissions, not only the current filter or page.
        </p>
      </section>

      <section aria-labelledby="submissions-heading" className="space-y-4">
        <h2 id="submissions-heading" className="text-lg font-semibold">
          Submissions
        </h2>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SearchBox
            value={q}
            basePath="/mentor/dashboard"
            params={{ status }}
            label="Search submissions"
            placeholder="Search project, repository, student or email"
            className="md:max-w-sm"
          />
          <p className="text-sm text-muted-foreground">
            Search by project, repository, student name or email.
          </p>
        </div>
        <StatusFilter current={status} q={q} />
        <Suspense
          key={`${status ?? "ALL"}-${page}`}
          fallback={<LoadingState label="Loading submissions…" rows={5} />}
        >
          <Reveal>
            <Submissions page={page} status={status} q={q} />
          </Reveal>
        </Suspense>
      </section>
    </PageContainer>
  );
}

async function Statistics() {
  return <StatisticsCards statistics={await getStatistics()} />;
}

async function Submissions({
  page,
  status,
  q,
}: {
  page: number;
  status?: SubmissionStatus;
  q: string;
}) {
  const { submissions, meta } = await getMentorSubmissions({ page, status, q });

  if (meta.total === 0) {
    if (q) {
      return (
        <EmptyState
          title={`No ${status ? `${STATUS_LABELS[status]} ` : ""}submissions match “${q}”`}
          description="Search by project name, repository, student name or email."
          action={
            <Button asChild variant="outline">
              <AppLink href={mentorDashboardHref({ status })}>Clear search</AppLink>
            </Button>
          }
        />
      );
    }
    return status ? (
      <EmptyState
        title={`No ${STATUS_LABELS[status]} submissions`}
        description="Try another filter."
        action={
          <Button asChild variant="outline">
            <AppLink href={mentorDashboardHref({})}>Show all submissions</AppLink>
          </Button>
        }
      />
    ) : (
      <EmptyState
        title="No submissions yet"
        description="Projects will appear here as soon as students submit them."
      />
    );
  }

  if (submissions.length === 0) {
    return (
      <EmptyState
        title="This page is empty"
        description={
          meta.totalPages === 1
            ? "There is only 1 page of results."
            : `There are only ${meta.totalPages} pages of results.`
        }
        action={
          <Button asChild variant="outline">
            <AppLink href={mentorDashboardHref({ status, q })}>Go to the first page</AppLink>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <MentorSubmissionsTable submissions={submissions} view={{ status, page: meta.page, q }} />
      <PaginationControls
        meta={meta}
        hrefForPage={(target) => mentorDashboardHref({ status, q, page: target })}
      />
    </div>
  );
}
