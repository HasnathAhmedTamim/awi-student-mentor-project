import type { Metadata } from "next";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Mentor dashboard" };
export const instant = false;

export default async function MentorDashboardPage() {
  const user = await requireRole("MENTOR");

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome, ${user.name}`}
        description="Review student project submissions."
      />
    </PageContainer>
  );
}
