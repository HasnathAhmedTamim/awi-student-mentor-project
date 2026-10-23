import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Button } from "@/components/ui/button";
import { SubmissionList } from "@/features/submissions/components/submission-list";
import { getMySubmissions } from "@/features/submissions/server";
import { requireRole } from "@/lib/auth/session";
import { parsePageParam } from "@/lib/format";

export const metadata: Metadata = { title: "Student dashboard" };
export const instant = false;

export default async function StudentDashboardPage({
  searchParams,
}: PageProps<"/student/dashboard">) {
  const user = await requireRole("STUDENT");
  const page = parsePageParam((await searchParams).page);

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome, ${user.name}`}
        description="Your project submissions and their review status."
        actions={<NewSubmissionButton />}
      />
      <Suspense key={page} fallback={<LoadingState label="Loading your submissions…" />}>
        <MySubmissions page={page} />
      </Suspense>
    </PageContainer>
  );
}

async function MySubmissions({ page }: { page: number }) {
  const { submissions, meta } = await getMySubmissions(page);

  if (meta.total === 0) {
    return (
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
        description={`You have ${meta.total} submission${meta.total === 1 ? "" : "s"}, but not on page ${page}.`}
        action={
          <Button asChild variant="outline">
            <Link href="/student/dashboard">Go to the first page</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <SubmissionList submissions={submissions} />
      <PaginationControls
        page={meta.page}
        totalPages={meta.totalPages}
        hrefForPage={(target) => `/student/dashboard?page=${target}`}
      />
    </div>
  );
}

function NewSubmissionButton() {
  return (
    <Button asChild>
      <Link href="/student/submissions/new">
        <PlusIcon aria-hidden="true" />
        New submission
      </Link>
    </Button>
  );
}
