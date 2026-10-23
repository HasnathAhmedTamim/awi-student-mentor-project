import "server-only";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import type { ApiSuccess } from "@/types/api";
import { ApiError } from "./api-error";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5000";

/**
 * Server-side client for Server Components. Calls Express directly and forwards
 * only the auth cookie from the incoming request.
 */
export async function serverApiRequest<T>(path: string): Promise<ApiSuccess<T>> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api${path}`, {
      headers: token ? { cookie: `${AUTH_COOKIE_NAME}=${token}` } : undefined,
    });
  } catch {
    throw ApiError.network();
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw ApiError.fromResponse(response.status, payload);
  }

  return payload as ApiSuccess<T>;
}
