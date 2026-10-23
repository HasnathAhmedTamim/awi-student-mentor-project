import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
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
import { parsePageParam, parseStatusParam } from "@/lib/search-params";
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
  const user = await requireRole("MENTOR");
  const params = await searchParams;
  const page = parsePageParam(params.page);
  const status = parseStatusParam(params.status);

  return (
    <PageContainer className="space-y-8">
      <PageHeader title={`Welcome, ${user.name}`} description="Review student project submissions." />

      <section aria-labelledby="statistics-heading">
        <h2 id="statistics-heading" className="sr-only">
          Statistics
        </h2>
        <Suspense fallback={<StatisticsCardsSkeleton />}>
          <Statistics />
        </Suspense>
      </section>

      <section aria-labelledby="submissions-heading" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="submissions-heading" className="text-lg font-semibold">
            Submissions
          </h2>
          <StatusFilter current={status} />
        </div>
        <Suspense
          key={`${status ?? "ALL"}-${page}`}
          fallback={<LoadingState label="Loading submissions…" rows={5} />}
        >
          <Submissions page={page} status={status} />
        </Suspense>
      </section>
    </PageContainer>
  );
}

async function Statistics() {
  return <StatisticsCards statistics={await getStatistics()} />;
}

async function Submissions({ page, status }: { page: number; status?: SubmissionStatus }) {
  const { submissions, meta } = await getMentorSubmissions({ page, status });

  if (meta.total === 0) {
    return status ? (
      <EmptyState
        title={`No ${STATUS_LABELS[status]} submissions`}
        description="Try another filter."
        action={
          <Button asChild variant="outline">
            <Link href={mentorDashboardHref({})}>Show all submissions</Link>
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
            <Link href={mentorDashboardHref({ status })}>Go to the first page</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <MentorSubmissionsTable submissions={submissions} />
      <PaginationControls
        page={meta.page}
        totalPages={meta.totalPages}
        hrefForPage={(target) => mentorDashboardHref({ status, page: target })}
      />
    </div>
  );
}
