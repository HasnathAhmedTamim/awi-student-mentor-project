"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/shared/error-state";
import { PageContainer } from "@/components/shared/page-container";

export default function StudentError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer>
      <ErrorState message="We could not load your submissions. Please try again." onRetry={retry} />
    </PageContainer>
  );
}
