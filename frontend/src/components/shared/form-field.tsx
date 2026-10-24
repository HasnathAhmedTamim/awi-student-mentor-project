import { Label } from "@/components/ui/label";

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  /** Shown next to the label, e.g. a character count. */
  aside?: React.ReactNode;
  children: React.ReactNode;
};

/** Label + control + hint/error. The control should set `aria-describedby={fieldDescriptionId(id)}`. */
export function FormField({ id, label, error, hint, aside, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {aside && <span className="text-xs text-muted-foreground tabular-nums">{aside}</span>}
      </div>
      {children}
      {error ? (
        <p id={fieldDescriptionId(id)} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        hint && (
          <p id={fieldDescriptionId(id)} className="text-sm text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export function fieldDescriptionId(id: string) {
  return `${id}-description`;
}
