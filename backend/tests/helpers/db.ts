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

export async function createSubmission(
  studentId: string,
  overrides: Partial<{ projectName: string; repo: string; createdAt: Date }> = {},
) {
  const repo = overrides.repo ?? `owner/repo-${crypto.randomUUID()}`;
  return prisma.submission.create({
    data: {
      studentId,
      projectName: overrides.projectName ?? "Test Project",
      repositoryUrl: `https://github.com/${repo}`,
      repositoryUrlNormalized: `https://github.com/${repo}`.toLowerCase(),
      liveUrl: "https://example.com",
      description: "A project created for tests.",
      ...(overrides.createdAt && { createdAt: overrides.createdAt }),
    },
  });
}
