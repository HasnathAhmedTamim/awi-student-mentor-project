const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}

/** Reads a `?page=` search param; anything that is not a positive integer becomes 1. */
export function parsePageParam(value: string | string[] | undefined) {
  const page = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}
