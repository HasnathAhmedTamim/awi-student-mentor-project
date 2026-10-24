import { ArrowLeftIcon, RotateCcwIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { SubmissionDetails } from "@/features/submissions/components/submission-details";
import { getSubmission } from "@/features/submissions/server";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Submission" };
export const instant = false;

export default async function StudentSubmissionPage({
  params,
}: PageProps<"/student/submissions/[id]">) {
  await requireRole("STUDENT");
  const { id } = await params;
  const submission = await getSubmission(id);

  return (
    <PageContainer className="max-w-3xl space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/student/dashboard">
          <ArrowLeftIcon aria-hidden="true" />
          Back to dashboard
        </Link>
      </Button>
      <SubmissionDetails submission={submission} />
      {submission.status === "REJECTED" && (
        <Button asChild>
          <Link href="/student/submissions/new">
            <RotateCcwIcon aria-hidden="true" />
            Submit again
          </Link>
        </Button>
      )}
    </PageContainer>
  );
}
