import type { ApiSuccess } from "@/types/api";
import { ApiError } from "./api-error";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  signal?: AbortSignal;
};

/**
 * Browser-side client. Requests go to the same origin (`/api/...`) and are
 * rewritten by Next.js to the Express backend, so the auth cookie stays first-party.
 */
export async function apiRequest<T>(
  path: string,
  { method = "GET", body, signal }: RequestOptions = {},
): Promise<ApiSuccess<T>> {
  let response: Response;

  try {
    response = await fetch(`/api${path}`, {
      method,
      signal,
      credentials: "same-origin",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw ApiError.network();
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw ApiError.fromResponse(response.status, payload);
  }

  return payload as ApiSuccess<T>;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => apiRequest<T>(path, { signal }),
  post: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "PATCH", body }),
};
