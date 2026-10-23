import { SubmissionStatus, type Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { buildPaginationMeta, toSkipTake } from "../../utils/pagination.js";
import { submissionSelect } from "../submissions/submissions.types.js";
import type { ListMentorSubmissionsQuery } from "./mentor.validation.js";

const mentorSubmissionSelect = {
  ...submissionSelect,
  student: { select: { id: true, name: true, email: true } },
} satisfies Prisma.SubmissionSelect;

export async function listSubmissions({ status, ...pagination }: ListMentorSubmissionsQuery) {
  const where: Prisma.SubmissionWhereInput = status ? { status } : {};
  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      select: mentorSubmissionSelect,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      ...toSkipTake(pagination),
    }),
    prisma.submission.count({ where }),
  ]);

  return { submissions, meta: buildPaginationMeta(pagination, total) };
}

export async function getStatistics() {
  const groups = await prisma.submission.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const countFor = (status: SubmissionStatus) =>
    groups.find((group) => group.status === status)?._count._all ?? 0;

  const pending = countFor(SubmissionStatus.PENDING);
  const approved = countFor(SubmissionStatus.APPROVED);
  const rejected = countFor(SubmissionStatus.REJECTED);

  return { total: pending + approved + rejected, pending, approved, rejected };
}
