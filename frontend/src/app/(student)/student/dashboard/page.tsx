import { PlusIcon } from "lucide-react";
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
import { SubmissionList } from "@/features/submissions/components/submission-list";
import { studentDashboardHref } from "@/features/submissions/dashboard-href";
import { getMySubmissions } from "@/features/submissions/server";
import { requireRole } from "@/lib/auth/session";
import { parsePageParam, parseSearchParam } from "@/lib/search-params";

export const metadata: Metadata = { title: "Student dashboard" };
export const instant = false;

export default async function StudentDashboardPage({
  searchParams,
}: PageProps<"/student/dashboard">) {
  await requireRole("STUDENT");
  const params = await searchParams;
  const page = parsePageParam(params.page);
  const q = parseSearchParam(params.q);

  return (
    <PageContainer className="space-y-4">
      <PageHeader
        title="My Submissions"
        description="Track your project reviews."
        actions={<NewSubmissionButton />}
      />
      <SearchBox
        value={q}
        basePath="/student/dashboard"
        label="Search your submissions"
        placeholder="Search project or repository"
        className="sm:max-w-sm"
      />
      <Suspense key={page} fallback={<LoadingState label="Loading your submissions…" />}>
        <Reveal>
          <MySubmissions page={page} q={q} />
        </Reveal>
      </Suspense>
    </PageContainer>
  );
}

async function MySubmissions({ page, q }: { page: number; q: string }) {
  const { submissions, meta } = await getMySubmissions({ page, q });

  if (meta.total === 0) {
    return q ? (
      <EmptyState
        title={`No submissions match “${q}”`}
        description="Search by project name or repository."
        action={
          <Button asChild variant="outline">
            <AppLink href={studentDashboardHref({})}>Clear search</AppLink>
          </Button>
        }
      />
    ) : (
      <EmptyState
        title="No submissions yet"
        description="Submit your first project and a mentor will review it."
        action={<NewSubmissionButton />}
      />
    );
  }

  if (submissions.length === 0) {
    return (
      <EmptyState
        title="This page is empty"
        description={`There ${meta.total === 1 ? "is 1 submission" : `are ${meta.total} submissions`}, but not on page ${page}.`}
        action={
          <Button asChild variant="outline">
            <AppLink href={studentDashboardHref({ q })}>Go to the first page</AppLink>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <SubmissionList submissions={submissions} view={{ page: meta.page, q }} />
      <PaginationControls
        meta={meta}
        hrefForPage={(target) => studentDashboardHref({ q, page: target })}
      />
    </div>
  );
}

function NewSubmissionButton() {
  return (
    <Button asChild>
      <AppLink href="/student/submissions/new">
        <PlusIcon aria-hidden="true" />
        Submit project
      </AppLink>
    </Button>
  );
}
