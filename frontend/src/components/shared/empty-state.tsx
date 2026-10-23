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
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
      <InboxIcon className="size-8 text-muted-foreground" aria-hidden="true" />
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
