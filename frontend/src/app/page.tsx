import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <PageContainer className="flex flex-col items-center justify-center gap-6 text-center">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Project Submission &amp; Review
        </h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Students submit their projects. Mentors review, approve, or reject them.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild size="lg">
          <Link href="/login">Log in</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/signup">Sign up as a student</Link>
        </Button>
      </div>
    </PageContainer>
  );
}
