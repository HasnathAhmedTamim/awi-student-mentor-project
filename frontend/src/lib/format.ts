const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}
