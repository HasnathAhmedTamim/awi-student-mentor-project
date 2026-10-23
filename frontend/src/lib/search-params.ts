import type { SubmissionStatus } from "@/types/submission";

type SearchParamValue = string | string[] | undefined;

const STATUSES: readonly SubmissionStatus[] = ["PENDING", "APPROVED", "REJECTED"];

function first(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

/** Reads a `?page=` search param; anything that is not a positive integer becomes 1. */
export function parsePageParam(value: SearchParamValue) {
  const page = Number(first(value));
  return Number.isInteger(page) && page > 0 ? page : 1;
}

/** Reads a `?status=` search param; unknown values mean "all statuses". */
export function parseStatusParam(value: SearchParamValue): SubmissionStatus | undefined {
  const status = first(value);
  return STATUSES.find((candidate) => candidate === status);
}
