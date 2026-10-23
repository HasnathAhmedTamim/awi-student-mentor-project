import type { CookieOptions } from "express";
import { env, isProduction } from "./env.js";

export const AUTH_COOKIE_NAME = "access_token";

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
};

export const authCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: env.JWT_EXPIRES_IN_SECONDS * 1000,
};

export const clearAuthCookieOptions: CookieOptions = baseCookieOptions;
