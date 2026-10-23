import type { RequestHandler } from "express";
import type { Role } from "../generated/prisma/client.js";
import { AppError } from "../utils/app-error.js";

/** Allows the request only if the authenticated user has one of the given roles. */
export function authorizeRoles(...allowedRoles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      throw new AppError(401, "UNAUTHENTICATED", "Please log in to continue.");
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(403, "FORBIDDEN", "You do not have permission to perform this action.");
    }
    next();
  };
}
