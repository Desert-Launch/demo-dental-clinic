"use client";

import { addMinutes, format, parseISO } from "date-fns";
import { CalendarDays, Clock, Stethoscope, UserRound } from "lucide-react";

import { NO_PREFERENCE } from "@/features/booking";
import { useDentists } from "@/features/dentists";
import { useServices } from "@/features/services";
import { minutesToDate } from "@/lib/scheduling";
import {
  cn,
  formatAED,
  formatDuration,
  formatMinutesOfDay,
  formatTime,
} from "@/lib/utils";

export interface BookingDraft {
  serviceId: string | null;
  dentistId: string;
  date: string | null;
  startMinutes: number | null;
}

/** The running total of what has been chosen so far, visible at every step. */
export function BookingSummary({
  draft,
  className,
}: {
  draft: BookingDraft;
  className?: string;
}) {
  const { data: services } = useServices();
  const { data: dentists } = useDentists();

  const service = services?.find((item) => item.id === draft.serviceId);
  const dentist = dentists?.find((item) => item.id === draft.dentistId);

  const start =
    draft.date && draft.startMinutes !== null
      ? minutesToDate(parseISO(draft.date), draft.startMinutes)
      : null;
  const end = start && service ? addMinutes(start, service.durationMinutes) : null;

  return (
    <aside
      className={cn(
        "rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-sm)]",
        className,
      )}
      aria-label="Your booking so far"
    >
      <h2 className="text-subtitle font-semibold text-ink-900">Your booking</h2>

      <dl className="mt-5 space-y-4">
        <SummaryRow
          icon={Stethoscope}
          label="Treatment"
          value={service?.name}
          hint={service ? formatDuration(service.durationMinutes) : undefined}
        />
        <SummaryRow
          icon={UserRound}
          label="Dentist"
          value={
            draft.dentistId === NO_PREFERENCE
              ? "First one free"
              : (dentist?.name ?? undefined)
          }
        />
        <SummaryRow
          icon={CalendarDays}
          label="Day"
          value={draft.date ? format(parseISO(draft.date), "EEEE d MMMM") : undefined}
        />
        <SummaryRow
          icon={Clock}
          label="Time"
          value={
            start && end
              ? `${formatMinutesOfDay(draft.startMinutes ?? 0)} – ${formatTime(end)}`
              : undefined
          }
        />
      </dl>

      {service ? (
        <div className="mt-6 flex items-end justify-between border-t border-border pt-4">
          <div>
            <p className="text-small text-ink-500">Price</p>
            <p className="text-small text-ink-500">{service.priceNote ?? "per visit"}</p>
          </div>
          <p
            data-numeric
            className="font-display text-title font-semibold text-brand-800"
          >
            {formatAED(service.priceAED)}
          </p>
        </div>
      ) : null}

      <p className="mt-5 text-small text-ink-500">
        Nothing is charged online. You pay at the desk after your appointment.
      </p>
    </aside>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Clock;
  label: string;
  value?: string;
  hint?: string;
}) {
  return (
    <div className="flex gap-3">
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
          value ? "bg-mint-100 text-brand-700" : "bg-surface-muted text-ink-400",
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <dt className="text-small text-ink-500">{label}</dt>
        <dd
          className={cn(
            "text-body font-medium",
            value ? "text-ink-900" : "text-ink-400",
          )}
        >
          {value ?? "Not chosen yet"}
          {hint && value ? (
            <span className="mt-0.5 block text-small font-normal text-ink-500">
              {hint}
            </span>
          ) : null}
        </dd>
      </div>
    </div>
  );
}
