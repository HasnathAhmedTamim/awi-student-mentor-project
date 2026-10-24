import { ArrowRightIcon, MessageSquareTextIcon, SendIcon, ShieldCheckIcon } from "lucide-react";
import { AppLink } from "@/components/shared/app-link";
import { Brand } from "@/components/shared/brand";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: SendIcon,
    title: "Submit your project",
    description: "Share the GitHub repository, the live site and a short description.",
  },
  {
    icon: ShieldCheckIcon,
    title: "A mentor reviews it",
    description: "Mentors check the code and the deployment, then approve or reject it.",
  },
  {
    icon: MessageSquareTextIcon,
    title: "Act on the feedback",
    description: "See the status and the mentor's note. Fix a rejected project and submit it again.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Brand />
        <nav aria-label="Account" className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <AppLink href="/login">Log in</AppLink>
          </Button>
          <Button asChild>
            <AppLink href="/signup">Sign up</AppLink>
          </Button>
        </nav>
      </header>

      <PageContainer className="flex flex-col items-center gap-10 py-10 text-center sm:gap-14 sm:py-16">
        <div className="space-y-6">
          <p className="mx-auto w-fit rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs">
            For students and mentors
          </p>
          <h1 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Submit projects. Get reviewed. <span className="text-primary">Keep improving.</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground text-pretty">
            Students submit their projects in one place. Mentors review them, approve or reject them, and leave
            feedback the student can act on.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-10 px-5">
              <AppLink href="/signup">
                Sign up as a student
                <ArrowRightIcon aria-hidden="true" />
              </AppLink>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-10 px-5">
              <AppLink href="/login">Log in</AppLink>
            </Button>
          </div>
        </div>

        <section aria-labelledby="how-it-works" className="w-full max-w-4xl space-y-6">
          <h2 id="how-it-works" className="text-sm font-medium text-muted-foreground">
            How it works
          </h2>
          <ol className="grid gap-4 text-left sm:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, description }, index) => (
              <li key={title} className="rounded-xl border bg-card p-5 shadow-xs">
                <div className="mb-4 flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">Step {index + 1}</span>
                </div>
                <h3 className="font-medium">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </li>
            ))}
          </ol>
        </section>
      </PageContainer>
    </div>
  );
}
