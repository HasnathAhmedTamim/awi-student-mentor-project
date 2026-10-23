import type { Request, Response } from "express";
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  clearAuthCookieOptions,
} from "../../config/cookie.js";
import { signAccessToken } from "../../lib/jwt.js";
import { getAuthUser } from "../../middlewares/authenticate.js";
import { sendSuccess } from "../../utils/api-response.js";
import * as authService from "./auth.service.js";
import type { LoginInput, SafeUser, SignupInput } from "./auth.types.js";

function setAuthCookie(res: Response, user: SafeUser) {
  const token = signAccessToken({ id: user.id, role: user.role });
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
}

export async function signup(req: Request<object, unknown, SignupInput>, res: Response) {
  const user = await authService.signup(req.body);
  setAuthCookie(res, user);
  sendSuccess(res, { user }, { statusCode: 201 });
}

export async function login(req: Request<object, unknown, LoginInput>, res: Response) {
  const user = await authService.login(req.body);
  setAuthCookie(res, user);
  sendSuccess(res, { user });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions);
  sendSuccess(res, null);
}

export async function me(req: Request, res: Response) {
  const user = await authService.getCurrentUser(getAuthUser(req).id);
  sendSuccess(res, { user });
}
