import { InboxIcon } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Use "h1" when the empty state is the whole page, e.g. a not-found page. */
  titleAs?: "h1" | "h2";
};

export function EmptyState({ title, description, action, titleAs: Title = "h2" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-card px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
        <InboxIcon className="size-6" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <Title className="font-medium">{title}</Title>
        {description && (
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
