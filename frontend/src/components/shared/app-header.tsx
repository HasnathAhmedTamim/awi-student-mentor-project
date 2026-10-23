import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { dashboardPath } from "@/lib/auth/constants";
import type { User } from "@/types/user";

const ROLE_LABELS = { STUDENT: "Student", MENTOR: "Mentor" } as const;

export function AppHeader({ user }: { user: User }) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={dashboardPath(user.role)} className="font-semibold tracking-tight">
          Project Review
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">{user.name}</span>
          <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
