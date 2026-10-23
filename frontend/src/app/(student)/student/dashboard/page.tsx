import type { Metadata } from "next";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Student dashboard" };
export const instant = false;

export default async function StudentDashboardPage() {
  const user = await requireRole("STUDENT");

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome, ${user.name}`}
        description="Your project submissions and their review status."
      />
    </PageContainer>
  );
}
