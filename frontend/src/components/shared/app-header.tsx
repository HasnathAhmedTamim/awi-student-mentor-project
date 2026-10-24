import { AppLink } from "@/components/shared/app-link";
import { AppNav } from "@/components/shared/app-nav";
import { Brand } from "@/components/shared/brand";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { dashboardPath } from "@/lib/auth/constants";
import type { User } from "@/types/user";

const ROLE_LABELS = { STUDENT: "Student", MENTOR: "Mentor" } as const;

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function AppHeader({ user }: { user: User }) {
  return (
    <header
      className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md"
      style={{ viewTransitionName: "site-header" }}
    >
      <div className="mx-auto flex min-h-14 w-full max-w-6xl flex-wrap items-center gap-x-2 gap-y-2 px-4 py-2 sm:h-14 sm:flex-nowrap sm:gap-4 sm:px-6 sm:py-0">
        <AppLink
          href={dashboardPath(user.role)}
          className="shrink-0 rounded-lg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <Brand nameClassName="sr-only sm:not-sr-only" />
        </AppLink>
        {user.role === "STUDENT" && (
          <div className="order-3 basis-full sm:order-none sm:basis-auto">
            <AppNav role={user.role} />
          </div>
        )}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span
              className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground"
              aria-hidden="true"
            >
              {initials(user.name)}
            </span>
            <span className="hidden flex-col leading-tight md:flex">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</span>
            </span>
            <span className="sr-only md:hidden">
              {user.name}, {ROLE_LABELS[user.role]}
            </span>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
