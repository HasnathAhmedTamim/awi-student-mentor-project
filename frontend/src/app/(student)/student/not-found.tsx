import { AppLink } from "@/components/shared/app-link";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";

export default function StudentNotFound() {
  return (
    <PageContainer>
      <EmptyState
        title="Not found"
        titleAs="h1"
        description="This page or submission does not exist, or it belongs to another student."
        action={
          <Button asChild variant="outline">
            <AppLink href="/student/dashboard">Back to dashboard</AppLink>
          </Button>
        }
      />
    </PageContainer>
  );
}
