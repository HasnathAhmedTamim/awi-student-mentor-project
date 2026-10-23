import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { ReviewActions } from "@/features/mentor/components/review-actions";
import { SubmissionDetails } from "@/features/submissions/components/submission-details";
import { getSubmission } from "@/features/submissions/server";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Review submission" };
export const instant = false;

export default async function MentorSubmissionPage({
  params,
}: PageProps<"/mentor/submissions/[id]">) {
  await requireRole("MENTOR");
  const { id } = await params;
  const submission = await getSubmission(id);

  return (
    <PageContainer className="max-w-3xl space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/mentor/dashboard">
          <ArrowLeftIcon aria-hidden="true" />
          Back to dashboard
        </Link>
      </Button>
      <SubmissionDetails
        submission={submission}
        showStudent
        pendingReview={
          <ReviewActions submission={{ id: submission.id, projectName: submission.projectName }} />
        }
      />
    </PageContainer>
  );
}
