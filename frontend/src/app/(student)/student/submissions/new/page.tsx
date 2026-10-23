import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmissionForm } from "@/features/submissions/components/submission-form";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Submit a project" };
export const instant = false;

export default async function NewSubmissionPage() {
  await requireRole("STUDENT");

  return (
    <PageContainer className="max-w-2xl space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/student/dashboard">
          <ArrowLeftIcon aria-hidden="true" />
          Back to dashboard
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            <h1>Submit a project</h1>
          </CardTitle>
          <CardDescription>
            A mentor will review it. You can submit each repository only once.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubmissionForm />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
