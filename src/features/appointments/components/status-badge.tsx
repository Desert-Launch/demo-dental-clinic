import { cn } from "@/lib/utils";
import { appointmentStatusLabels, type AppointmentStatus } from "@/types";

const statusStyles: Record<AppointmentStatus, string> = {
  scheduled: "bg-info-50 text-info-700 ring-info-100",
  confirmed: "bg-mint-100 text-brand-800 ring-mint-200",
  completed: "bg-success-50 text-success-700 ring-success-100",
  cancelled: "bg-ink-100 text-ink-600 ring-ink-200",
  "no-show": "bg-warning-50 text-warning-700 ring-warning-100",
};

export function StatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-small font-medium ring-1 ring-inset",
        statusStyles[status],
        className,
      )}
    >
      {appointmentStatusLabels[status]}
    </span>
  );
}
