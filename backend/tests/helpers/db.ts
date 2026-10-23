import { Role } from "../../src/generated/prisma/client.js";
import { hashPassword } from "../../src/lib/password.js";
import { prisma } from "../../src/lib/prisma.js";
import { assertLocalTestDatabase } from "./assert-test-database.js";

export const TEST_PASSWORD = "Password123";

export async function resetDatabase() {
  assertLocalTestDatabase();
  await prisma.$executeRaw`TRUNCATE TABLE "submissions", "users" CASCADE`;
}

let passwordHash: Promise<string> | undefined;

export async function createUser(
  overrides: Partial<{ name: string; email: string; role: Role }> = {},
) {
  passwordHash ??= hashPassword(TEST_PASSWORD);
  return prisma.user.create({
    data: {
      name: overrides.name ?? "Test User",
      email: overrides.email ?? `user-${crypto.randomUUID()}@example.com`,
      role: overrides.role ?? Role.STUDENT,
      passwordHash: await passwordHash,
    },
  });
}
