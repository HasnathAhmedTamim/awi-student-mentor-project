import { z } from "zod";
import { Role } from "../src/generated/prisma/client.js";
import { hashPassword } from "../src/lib/password.js";
import { prisma } from "../src/lib/prisma.js";

const seedEnvSchema = z.object({
  SEED_MENTOR_NAME: z.string().trim().min(1).default("Mentor"),
  SEED_MENTOR_EMAIL: z.email().trim().toLowerCase(),
  SEED_MENTOR_PASSWORD: z.string().min(8, "Use at least 8 characters"),
});

async function main() {
  const seedEnv = seedEnvSchema.parse(process.env);

  const existing = await prisma.user.findUnique({
    where: { email: seedEnv.SEED_MENTOR_EMAIL },
    select: { role: true },
  });

  if (existing && existing.role !== Role.MENTOR) {
    throw new Error("The configured mentor email belongs to a non-mentor account; refusing to change its role.");
  }

  const mentor =
    existing ??
    (await prisma.user.create({
      data: {
        name: seedEnv.SEED_MENTOR_NAME,
        email: seedEnv.SEED_MENTOR_EMAIL,
        passwordHash: await hashPassword(seedEnv.SEED_MENTOR_PASSWORD),
        role: Role.MENTOR,
      },
      select: { role: true },
    }));

  console.log(`Verified mentor account (${mentor.role}).`);
}

main()
  .catch((error: unknown) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
