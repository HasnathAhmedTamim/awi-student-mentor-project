import { ArrowLeftIcon, RotateCcwIcon } from "lucide-react";
import type { Metadata } from "next";
import { AppLink } from "@/components/shared/app-link";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { SubmissionDetails } from "@/features/submissions/components/submission-details";
import { studentDashboardHref } from "@/features/submissions/dashboard-href";
import { getSubmission } from "@/features/submissions/server";
import { requireRole } from "@/lib/auth/session";
import { parsePageParam, parseSearchParam } from "@/lib/search-params";

export const metadata: Metadata = { title: "Submission" };
export const instant = false;

export default async function StudentSubmissionPage({
  params,
  searchParams,
}: PageProps<"/student/submissions/[id]">) {
  await requireRole("STUDENT");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const submission = await getSubmission(id);
  const backHref = studentDashboardHref({
    page: parsePageParam(query.page),
    q: parseSearchParam(query.q),
  });

  return (
    <PageContainer className="max-w-5xl space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <AppLink href={backHref}>
          <ArrowLeftIcon aria-hidden="true" />
          Back to dashboard
        </AppLink>
      </Button>
      <SubmissionDetails
        submission={submission}
        rejectedAction={
          <Button asChild className="w-full">
            <AppLink href="/student/submissions/new">
              <RotateCcwIcon aria-hidden="true" />
              Submit again
            </AppLink>
          </Button>
        }
      />
    </PageContainer>
  );
}
