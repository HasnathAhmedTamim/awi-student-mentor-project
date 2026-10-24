import { randomBytes } from "node:crypto";
import { z } from "zod";
import { Role, SubmissionStatus } from "../src/generated/prisma/client.js";
import { hashPassword } from "../src/lib/password.js";
import { prisma } from "../src/lib/prisma.js";

const seedEnvSchema = z.object({
  DATABASE_URL: z.url(),
  SEED_MENTOR_NAME: z.string().trim().min(1).default("Mentor"),
  SEED_MENTOR_EMAIL: z.email().trim().toLowerCase(),
  SEED_MENTOR_PASSWORD: z.string().min(8, "Use at least 8 characters"),
  SEED_DEMO_STUDENT_PASSWORD: z.string().min(8).optional(),
  SEED_ALLOW_NEON_DEMO: z.enum(["true"]).optional(),
});

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const DEMO_STUDENTS = [
  { name: "Demo Queue Student", email: "demo-queue-student@example.test" },
  { name: "Demo Reviewed Student", email: "demo-reviewed-student@example.test" },
] as const;

async function getDemoStudent(name: string, email: string, password?: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.name !== name || existing.role !== Role.STUDENT) {
      throw new Error(`Refusing to change the existing account ${email}.`);
    }
    return existing;
  }
  if (!password) throw new Error(`A password is required to create ${email}.`);

  return prisma.user.create({
    data: { name, email, passwordHash: await hashPassword(password), role: Role.STUDENT },
  });
}

async function ensureDemoSubmission({
  studentId,
  projectName,
  repositoryPath,
  status,
  createdAt,
  mentorId,
}: {
  studentId: string;
  projectName: string;
  repositoryPath: string;
  status: SubmissionStatus;
  createdAt: Date;
  mentorId: string;
}) {
  const repositoryUrl = `https://github.com/awi-student-mentor-demo/${repositoryPath}`;
  const repositoryUrlNormalized = repositoryUrl.toLowerCase();
  const existing = await prisma.submission.findFirst({
    where: { studentId, repositoryUrl },
    select: { id: true, projectName: true },
  });

  if (existing && existing.projectName !== projectName) {
    throw new Error(`Refusing to overwrite a non-demo submission at ${repositoryUrl}.`);
  }

  if (existing) return false;

  const reviewNote =
    status === SubmissionStatus.APPROVED
      ? "Well organized, easy to follow, and clearly presented."
      : status === SubmissionStatus.REJECTED
        ? "Please add setup instructions and improve the mobile layout before resubmitting."
        : null;
  const reviewedAt = status === SubmissionStatus.PENDING ? null : createdAt;
  const data = {
    projectName,
    repositoryUrl,
    repositoryUrlNormalized:
      status === SubmissionStatus.REJECTED ? null : repositoryUrlNormalized,
    liveUrl: `https://${repositoryPath}.vercel.app`,
    description: `Demo submission for checking the ${status.toLowerCase()} review workflow, search, and pagination.`,
    status,
    reviewNote,
    reviewedById: status === SubmissionStatus.PENDING ? null : mentorId,
    reviewedAt,
    createdAt,
  };

  await prisma.submission.create({ data: { ...data, studentId } });
  return true;
}

async function main() {
  const seedEnv = seedEnvSchema.parse(process.env);
  const databaseUrl = new URL(seedEnv.DATABASE_URL);
  const databaseName = databaseUrl.pathname.slice(1);
  const isLocalDemoDatabase =
    LOCAL_HOSTS.has(databaseUrl.hostname) && databaseName === "awi_dev";
  const isOptedInNeonDemoDatabase =
    seedEnv.SEED_ALLOW_NEON_DEMO === "true" &&
    databaseUrl.hostname.endsWith(".neon.tech") &&
    databaseName === "neondb";

  if (!isLocalDemoDatabase && !isOptedInNeonDemoDatabase) {
    throw new Error(
      "Demo seeding is restricted to local awi_dev. Neon requires SEED_ALLOW_NEON_DEMO=true, a *.neon.tech host, and database neondb.",
    );
  }

  const existingMentor = await prisma.user.findUnique({
    where: { email: seedEnv.SEED_MENTOR_EMAIL },
    select: { id: true, role: true },
  });
  if (existingMentor && existingMentor.role !== Role.MENTOR) {
    throw new Error("The configured mentor email belongs to a non-mentor account; refusing to change its role.");
  }
  const mentor =
    existingMentor ??
    (await prisma.user.create({
      data: {
        name: seedEnv.SEED_MENTOR_NAME,
        email: seedEnv.SEED_MENTOR_EMAIL,
        passwordHash: await hashPassword(seedEnv.SEED_MENTOR_PASSWORD),
        role: Role.MENTOR,
      },
      select: { id: true, role: true },
    }));

  const [existingQueueStudent, existingReviewedStudent] = await Promise.all([
    prisma.user.findUnique({ where: { email: DEMO_STUDENTS[0].email } }),
    prisma.user.findUnique({ where: { email: DEMO_STUDENTS[1].email } }),
  ]);
  for (const [expected, existing] of [
    [DEMO_STUDENTS[0], existingQueueStudent],
    [DEMO_STUDENTS[1], existingReviewedStudent],
  ] as const) {
    if (existing && (existing.name !== expected.name || existing.role !== Role.STUDENT)) {
      throw new Error(`Refusing to change the existing account ${expected.email}.`);
    }
  }

  const generatedStudentPassword =
    !seedEnv.SEED_DEMO_STUDENT_PASSWORD && (!existingQueueStudent || !existingReviewedStudent)
      ? randomBytes(24).toString("base64url")
      : undefined;
  const studentPassword = seedEnv.SEED_DEMO_STUDENT_PASSWORD ?? generatedStudentPassword;
  const [queueStudent, reviewedStudent] = await Promise.all([
    getDemoStudent(DEMO_STUDENTS[0].name, DEMO_STUDENTS[0].email, studentPassword),
    getDemoStudent(DEMO_STUDENTS[1].name, DEMO_STUDENTS[1].email, studentPassword),
  ]);

  const now = new Date();
  let createdSubmissions = 0;
  for (let index = 1; index <= 12; index += 1) {
    const day = new Date(now);
    day.setUTCDate(now.getUTCDate() - (14 - index));
    if (
      await ensureDemoSubmission({
        studentId: queueStudent.id,
        projectName: `Demo Queue: Project ${String(index).padStart(2, "0")}`,
        repositoryPath: `queue-project-${String(index).padStart(2, "0")}`,
        status: SubmissionStatus.PENDING,
        createdAt: day,
        mentorId: mentor.id,
      })
    ) {
      createdSubmissions += 1;
    }
  }

  if (
    await ensureDemoSubmission({
      studentId: reviewedStudent.id,
      projectName: "Demo Reviewed: Approved project",
      repositoryPath: "approved-project",
      status: SubmissionStatus.APPROVED,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      mentorId: mentor.id,
    })
  ) {
    createdSubmissions += 1;
  }
  if (
    await ensureDemoSubmission({
      studentId: reviewedStudent.id,
      projectName: "Demo Reviewed: Rejected project",
      repositoryPath: "rejected-project",
      status: SubmissionStatus.REJECTED,
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      mentorId: mentor.id,
    })
  ) {
    createdSubmissions += 1;
  }

  console.log(
    `Verified mentor and 2 demo students in ${isLocalDemoDatabase ? "local awi_dev" : "Neon neondb"}; created ${createdSubmissions} missing demo submissions and preserved existing records.`,
  );
  if (generatedStudentPassword) {
    console.log(`New demo student login password: ${generatedStudentPassword}`);
  }
}

main()
  .catch((error: unknown) => {
    console.error("Demo seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
