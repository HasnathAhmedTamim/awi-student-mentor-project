import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import { AppLink } from "@/components/shared/app-link";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { ReviewActions } from "@/features/mentor/components/review-actions";
import { mentorDashboardHref } from "@/features/mentor/dashboard-href";
import { SubmissionDetails } from "@/features/submissions/components/submission-details";
import { getSubmission } from "@/features/submissions/server";
import { requireRole } from "@/lib/auth/session";
import { parsePageParam, parseSearchParam, parseStatusParam } from "@/lib/search-params";

export const metadata: Metadata = { title: "Review submission" };
export const instant = false;

export default async function MentorSubmissionPage({
  params,
  searchParams,
}: PageProps<"/mentor/submissions/[id]">) {
  await requireRole("MENTOR");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const submission = await getSubmission(id);
  const backHref = mentorDashboardHref({
    status: parseStatusParam(query.status),
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
        showStudent
        reviewActions={
          <ReviewActions
            submission={{
              id: submission.id,
              projectName: submission.projectName,
              status: submission.status,
            }}
            view={{
              status: parseStatusParam(query.status),
              page: parsePageParam(query.page),
              q: parseSearchParam(query.q),
            }}
          />
        }
      />
    </PageContainer>
  );
}
