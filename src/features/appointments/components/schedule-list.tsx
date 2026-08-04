"use client";

import { CalendarCheck2 } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/features/appointments/components/status-badge";
import { cn, formatDuration, formatTime, initials } from "@/lib/utils";
import { patientFullName, type AppointmentWithRelations } from "@/types";

export function ScheduleList({
  appointments,
  isLoading,
  emptyAction,
  onSelect,
}: {
  appointments: AppointmentWithRelations[] | undefined;
  isLoading: boolean;
  emptyAction?: React.ReactNode;
  onSelect?: (appointment: AppointmentWithRelations) => void;
}) {
  if (isLoading) {
    return (
      <ul className="space-y-2">
        {Array.from({ length: 4 }, (_, index) => (
          <li key={index}>
            <Skeleton className="h-[4.5rem] rounded-lg" />
          </li>
        ))}
      </ul>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <EmptyState
        icon={CalendarCheck2}
        title="Nothing in the diary today"
        description="A clear day. Good time to call back the patients waiting on a treatment plan."
        action={emptyAction}
      />
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
      {appointments.map((appointment) => {
        const start = new Date(appointment.startsAt);
        const cancelled = appointment.status === "cancelled";

        const content = (
          <>
            <div className="w-20 shrink-0">
              <p
                data-numeric
                className={cn(
                  "text-body font-semibold",
                  cancelled ? "text-ink-400 line-through" : "text-ink-900",
                )}
              >
                {formatTime(start)}
              </p>
              <p className="text-small text-ink-500">
                {formatDuration(appointment.durationMinutes)}
              </p>
            </div>

            <span
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mint-100 text-small font-semibold text-brand-800"
            >
              {initials(patientFullName(appointment.patient))}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-body font-medium text-ink-900">
                {patientFullName(appointment.patient)}
              </p>
              <p className="truncate text-small text-ink-600">
                {appointment.service.name} · {appointment.dentist.name}
              </p>
            </div>

            <StatusBadge status={appointment.status} className="shrink-0" />
          </>
        );

        return (
          <li key={appointment.id} className="bg-surface">
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(appointment)}
                className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-mint-50"
              >
                {content}
              </button>
            ) : (
              <div className="flex items-center gap-4 px-4 py-3.5">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
