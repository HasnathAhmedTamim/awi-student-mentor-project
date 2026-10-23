import { rateLimit } from "express-rate-limit";
import { isTest } from "../config/env.js";
import { sendError } from "../utils/api-response.js";

type RateLimiterOptions = {
  windowMs: number;
  limit: number;
  message: string;
  skipSuccessfulRequests?: boolean;
  skip?: boolean;
};

export function createRateLimiter({
  windowMs,
  limit,
  message,
  skipSuccessfulRequests = false,
  skip = false,
}: RateLimiterOptions) {
  return rateLimit({
    windowMs,
    limit,
    skipSuccessfulRequests,
    skip: () => skip,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, res) => {
      sendError(res, 429, { code: "RATE_LIMITED", message });
    },
  });
}

const MINUTE = 60 * 1000;

/** Counts failed attempts only, so a user who logs in successfully is not penalized. */
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * MINUTE,
  limit: 10,
  skipSuccessfulRequests: true,
  message: "Too many failed login attempts. Please try again in 15 minutes.",
  skip: isTest,
});

export const signupRateLimiter = createRateLimiter({
  windowMs: 60 * MINUTE,
  limit: 5,
  message: "Too many accounts created from this network. Please try again later.",
  skip: isTest,
});
