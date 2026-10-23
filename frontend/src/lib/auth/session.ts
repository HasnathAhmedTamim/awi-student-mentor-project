import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { ApiError } from "@/lib/api/api-error";
import { serverApiRequest } from "@/lib/api/server";
import type { Role, User } from "@/types/user";
import { AUTH_COOKIE_NAME, dashboardPath } from "./constants";

/**
 * Returns the logged-in user, or null. Memoized per request.
 * The backend verifies the token; the frontend never decodes or trusts it.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const hasToken = (await cookies()).has(AUTH_COOKIE_NAME);
  if (!hasToken) return null;

  try {
    const { data } = await serverApiRequest<{ user: User }>("/auth/me");
    return data.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
});

/** Redirects to login, or to the user's own dashboard if the role does not match. */
export async function requireRole(role: Role): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== role) redirect(dashboardPath(user.role));
  return user;
}
