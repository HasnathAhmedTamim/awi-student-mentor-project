import { AUTH_COOKIE_NAME } from "../../src/config/cookie.js";
import type { Role } from "../../src/generated/prisma/client.js";
import { signAccessToken } from "../../src/lib/jwt.js";

/** Builds a Cookie header carrying a valid access token for the given user. */
export function authCookie(user: { id: string; role: Role }) {
  return `${AUTH_COOKIE_NAME}=${signAccessToken({ id: user.id, role: user.role })}`;
}
