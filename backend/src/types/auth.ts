import type { Role } from "../generated/prisma/client.js";

/** Identity extracted from a verified access token. */
export type AuthUser = {
  id: string;
  role: Role;
};
