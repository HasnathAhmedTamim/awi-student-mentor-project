import { randomUUID } from "node:crypto";
import { Role } from "../../generated/prisma/client.js";
import { hashPassword, verifyPassword } from "../../lib/password.js";
import { prisma } from "../../lib/prisma.js";
import { isUniqueConstraintError } from "../../lib/prisma-errors.js";
import { AppError } from "../../utils/app-error.js";
import { safeUserSelect, type LoginInput, type SafeUser, type SignupInput } from "./auth.types.js";

let dummyPasswordHash: Promise<string> | undefined;

/** Used when the email does not exist, so both failure paths take the same time. */
function getDummyPasswordHash() {
  dummyPasswordHash ??= hashPassword(randomUUID());
  return dummyPasswordHash;
}

export async function signup(input: SignupInput): Promise<SafeUser> {
  const passwordHash = await hashPassword(input.password);

  try {
    return await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: Role.STUDENT,
      },
      select: safeUserSelect,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AppError(409, "EMAIL_TAKEN", "An account with this email already exists.", [
        { field: "email", message: "An account with this email already exists." },
      ]);
    }
    throw error;
  }
}

export async function login(input: LoginInput): Promise<SafeUser> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { ...safeUserSelect, passwordHash: true },
  });

  const passwordMatches = await verifyPassword(
    input.password,
    user?.passwordHash ?? (await getDummyPasswordHash()),
  );

  if (!user || !passwordMatches) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  }

  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function getCurrentUser(userId: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: safeUserSelect,
  });

  if (!user) {
    throw new AppError(401, "UNAUTHENTICATED", "Your account no longer exists. Please log in again.");
  }

  return user;
}
