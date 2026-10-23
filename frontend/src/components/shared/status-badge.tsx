import { CircleCheckIcon, CircleXIcon, ClockIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SubmissionStatus } from "@/types/submission";

const STATUS_CONFIG = {
  PENDING: { label: "Pending", icon: ClockIcon, variant: "outline", className: "" },
  APPROVED: {
    label: "Approved",
    icon: CircleCheckIcon,
    variant: "secondary",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  REJECTED: { label: "Rejected", icon: CircleXIcon, variant: "destructive", className: "" },
} as const;

/** Status is always shown as text with an icon, never by color alone. */
export function StatusBadge({ status }: { status: SubmissionStatus }) {
  const { label, icon: Icon, variant, className } = STATUS_CONFIG[status];
  return (
    <Badge variant={variant} className={className || undefined}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}
