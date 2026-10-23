import type { z } from "zod";
import type { Prisma } from "../../generated/prisma/client.js";
import type { loginSchema, signupSchema } from "./auth.validation.js";

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/** The only user fields that may leave the API. Never includes `passwordHash`. */
export const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof safeUserSelect }>;
