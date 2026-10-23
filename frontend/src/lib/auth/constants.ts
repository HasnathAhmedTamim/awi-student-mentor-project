import type { Role } from "@/types/user";

/** Must match the cookie name set by the backend. */
export const AUTH_COOKIE_NAME = "access_token";

const DASHBOARD_PATHS: Record<Role, string> = {
  STUDENT: "/student/dashboard",
  MENTOR: "/mentor/dashboard",
};

export function dashboardPath(role: Role) {
  return DASHBOARD_PATHS[role];
}
