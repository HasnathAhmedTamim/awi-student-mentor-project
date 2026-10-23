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

  const mentor = await prisma.user.upsert({
    where: { email: seedEnv.SEED_MENTOR_EMAIL },
    update: { role: Role.MENTOR },
    create: {
      name: seedEnv.SEED_MENTOR_NAME,
      email: seedEnv.SEED_MENTOR_EMAIL,
      passwordHash: await hashPassword(seedEnv.SEED_MENTOR_PASSWORD),
      role: Role.MENTOR,
    },
    select: { email: true, role: true },
  });

  console.log(`Seeded ${mentor.role}: ${mentor.email}`);
}

main()
  .catch((error: unknown) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
