import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { Role } from "../generated/prisma/client.js";
import type { AuthUser } from "../types/auth.js";

const ALGORITHM = "HS256";

const payloadSchema = z.object({
  sub: z.uuid(),
  role: z.enum(Role),
});

export type VerifyTokenResult =
  | { ok: true; user: AuthUser }
  | { ok: false; reason: "expired" | "invalid" };

export function signAccessToken(user: AuthUser): string {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, {
    algorithm: ALGORITHM,
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN_SECONDS,
  });
}

export function verifyAccessToken(token: string): VerifyTokenResult {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: [ALGORITHM] });
    const payload = payloadSchema.safeParse(decoded);
    if (!payload.success) return { ok: false, reason: "invalid" };
    return { ok: true, user: { id: payload.data.sub, role: payload.data.role } };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) return { ok: false, reason: "expired" };
    return { ok: false, reason: "invalid" };
  }
}
