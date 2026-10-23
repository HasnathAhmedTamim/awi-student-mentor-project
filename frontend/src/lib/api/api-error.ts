import type { ApiErrorBody, FieldError } from "@/types/api";

const FALLBACK_MESSAGES: Record<number, string> = {
  400: "Some of the information you entered is invalid.",
  401: "Your session has expired. Please log in again.",
  403: "You do not have permission to do that.",
  404: "We could not find what you were looking for.",
  409: "This conflicts with existing data.",
  413: "The request is too large.",
  429: "Too many requests. Please wait a moment and try again.",
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details: FieldError[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }

  static fromResponse(status: number, body: unknown): ApiError {
    if (isApiErrorBody(body)) {
      return new ApiError(status, body.code, body.message, body.details ?? []);
    }
    return new ApiError(
      status,
      "UNEXPECTED_RESPONSE",
      FALLBACK_MESSAGES[status] ?? "Something went wrong. Please try again.",
    );
  }

  static network(): ApiError {
    return new ApiError(
      0,
      "NETWORK_ERROR",
      "Cannot reach the server. Check your connection and try again.",
    );
  }
}

function isApiErrorBody(body: unknown): body is ApiErrorBody {
  return (
    typeof body === "object" &&
    body !== null &&
    (body as ApiErrorBody).success === false &&
    typeof (body as ApiErrorBody).code === "string" &&
    typeof (body as ApiErrorBody).message === "string"
  );
}
