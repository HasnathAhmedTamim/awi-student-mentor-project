import { AppLink } from "@/components/shared/app-link";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageContainer className="flex flex-col items-center justify-center gap-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        The page you are looking for does not exist or you do not have access to it.
      </p>
      <Button asChild variant="outline">
        <AppLink href="/">Go to home</AppLink>
      </Button>
    </PageContainer>
  );
}
