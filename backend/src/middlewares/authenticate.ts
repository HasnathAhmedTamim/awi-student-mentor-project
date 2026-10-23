import type { Request, RequestHandler } from "express";
import { AUTH_COOKIE_NAME } from "../config/cookie.js";
import { verifyAccessToken } from "../lib/jwt.js";
import type { AuthUser } from "../types/auth.js";
import { AppError } from "../utils/app-error.js";

const unauthenticated = () =>
  new AppError(401, "UNAUTHENTICATED", "Please log in to continue.");

/**
 * Verifies the access token cookie and attaches `req.user`.
 * Identity and role come only from the signed token, never from the request body.
 */
export const authenticate: RequestHandler = (req, _res, next) => {
  const token: unknown = req.cookies?.[AUTH_COOKIE_NAME];
  if (typeof token !== "string" || token.length === 0) throw unauthenticated();

  const result = verifyAccessToken(token);
  if (!result.ok) {
    throw result.reason === "expired"
      ? new AppError(401, "TOKEN_EXPIRED", "Your session has expired. Please log in again.")
      : new AppError(401, "INVALID_TOKEN", "Your session is invalid. Please log in again.");
  }

  req.user = result.user;
  next();
};

/** Returns the authenticated user; use only on routes behind `authenticate`. */
export function getAuthUser(req: Request): AuthUser {
  if (!req.user) throw unauthenticated();
  return req.user;
}
