"use client";

import { LayoutListIcon, PlusIcon } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { AppLink } from "@/components/shared/app-link";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/user";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: (pathname: string, status: string | null) => boolean;
};

const NAV_ITEMS: Record<Role, NavItem[]> = {
  STUDENT: [
    {
      href: "/student/dashboard",
      label: "My submissions",
      icon: LayoutListIcon,
      isActive: (pathname) => pathname.startsWith("/student") && pathname !== "/student/submissions/new",
    },
    {
      href: "/student/submissions/new",
      label: "Submit project",
      icon: PlusIcon,
      isActive: (pathname) => pathname === "/student/submissions/new",
    },
  ],
  MENTOR: [],
};

export function AppNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const status = useSearchParams().get("status");
  const items = NAV_ITEMS[role];

  if (items.length === 0) return null;

  return (
    <nav aria-label="Main">
      <ul className="flex flex-wrap items-center gap-1">
        {items.map(({ href, label, icon: Icon, isActive }) => {
          const active = isActive(pathname, status);
          return (
            <li key={href}>
              <AppLink
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:px-2.5 sm:text-sm",
                  active && "bg-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span>{label}</span>
              </AppLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
