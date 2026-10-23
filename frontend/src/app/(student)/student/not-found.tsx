import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";

export default function StudentNotFound() {
  return (
    <PageContainer>
      <EmptyState
        title="Not found"
        description="This page or submission does not exist, or it belongs to another student."
        action={
          <Button asChild variant="outline">
            <Link href="/student/dashboard">Back to dashboard</Link>
          </Button>
        }
      />
    </PageContainer>
  );
}
