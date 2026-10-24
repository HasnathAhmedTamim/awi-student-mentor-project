import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import { AppLink } from "@/components/shared/app-link";
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
        <AppLink href="/student/dashboard">
          <ArrowLeftIcon aria-hidden="true" />
          Back to dashboard
        </AppLink>
      </Button>
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">
            <h1>Submit a project</h1>
          </CardTitle>
          <CardDescription>Provide your project details for mentor review.</CardDescription>
        </CardHeader>
        <CardContent>
          <SubmissionForm />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
