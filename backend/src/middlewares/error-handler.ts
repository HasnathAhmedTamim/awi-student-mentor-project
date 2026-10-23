import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { isProduction } from "../config/env.js";
import { sendError } from "../utils/api-response.js";
import { AppError } from "../utils/app-error.js";

type BodyParserError = Error & { type?: string; status?: number };

function isBodyParserError(error: unknown): error is BodyParserError {
  return error instanceof Error && typeof (error as BodyParserError).type === "string";
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    return sendError(res, error.statusCode, {
      code: error.code,
      message: error.message,
      ...(error.details !== undefined && { details: error.details }),
    });
  }

  if (error instanceof ZodError) {
    return sendError(res, 400, {
      code: "VALIDATION_ERROR",
      message: "Some fields are invalid.",
      details: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (isBodyParserError(error)) {
    if (error.type === "entity.too.large") {
      return sendError(res, 413, {
        code: "PAYLOAD_TOO_LARGE",
        message: "Request body is too large.",
      });
    }
    if (error.type === "entity.parse.failed") {
      return sendError(res, 400, {
        code: "INVALID_JSON",
        message: "Request body must be valid JSON.",
      });
    }
  }

  console.error(isProduction ? (error as Error)?.message : error);

  return sendError(res, 500, {
    code: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong. Please try again later.",
  });
};
