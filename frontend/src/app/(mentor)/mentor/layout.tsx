import { Suspense } from "react";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { ProtectedShell } from "@/features/auth/components/protected-shell";

/** Every request re-verifies the session with the backend, so navigations here may block. */
export const instant = false;

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <LoadingState label="Checking your session…" />
        </PageContainer>
      }
    >
      <ProtectedShell role="MENTOR">{children}</ProtectedShell>
    </Suspense>
  );
}
