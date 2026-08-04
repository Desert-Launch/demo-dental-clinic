"use client";

import Link from "next/link";
import { addMinutes, format } from "date-fns";
import { CalendarPlus, Check, LayoutDashboard, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { BookingResult } from "@/features/booking";
import { site } from "@/lib/site";
import { formatAED, formatDuration, formatTime } from "@/lib/utils";

export function StepConfirmation({
  result,
  onBookAnother,
}: {
  result: BookingResult;
  onBookAnother: () => void;
}) {
  const { appointment, isNewPatient } = result;
  const start = new Date(appointment.startsAt);
  const end = addMinutes(start, appointment.durationMinutes);

  return (
    <div className="rounded-xl border border-mint-300 bg-mint-50 p-7 sm:p-9">
      <span className="flex size-12 items-center justify-center rounded-full bg-brand-700 text-ink-0">
        <Check className="size-6" aria-hidden />
      </span>

      <h1 className="mt-6 text-display-3 text-ink-950">Booking confirmed</h1>
      <p className="mt-3 max-w-lg text-lead text-ink-700">
        {isNewPatient
          ? `Welcome to the studio, ${appointment.patient.firstName}. `
          : `Good to see you again, ${appointment.patient.firstName}. `}
        A confirmation is on its way to {appointment.patient.email}.
      </p>

      <div className="mt-7 rounded-lg border border-mint-200 bg-surface p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-small text-ink-500">Booking reference</p>
          <p
            data-numeric
            className="font-display text-title font-semibold tracking-wide text-brand-800"
          >
            {appointment.reference}
          </p>
        </div>

        <Separator className="my-5" />

        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail
            label="When"
            value={`${format(start, "EEEE d MMMM")}, ${formatTime(start)}`}
          />
          <Detail
            label="How long"
            value={`${formatDuration(appointment.durationMinutes)} — until ${formatTime(end)}`}
          />
          <Detail label="Treatment" value={appointment.service.name} />
          <Detail label="With" value={appointment.dentist.name} />
          <Detail label="Price" value={formatAED(appointment.priceAED)} />
          <Detail label="Status" value="Scheduled — we confirm by phone" />
        </dl>

        <Separator className="my-5" />

        <p className="flex items-start gap-2.5 text-small text-ink-600">
          <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
          <span>
            {site.address.line1}, {site.address.line2}. {site.parking}. Arrive five
            minutes early if it is your first visit.
          </span>
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/admin/appointments">
            <LayoutDashboard aria-hidden />
            See it in the clinic dashboard
          </Link>
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={onBookAnother}>
          <CalendarPlus aria-hidden />
          Book another appointment
        </Button>
      </div>

      <p className="mt-5 text-small text-ink-500">
        Need to change it? Call {site.phone} — cancellation is free up to 24 hours
        before.
      </p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-small text-ink-500">{label}</dt>
      <dd className="mt-0.5 text-body font-medium text-ink-900">{value}</dd>
    </div>
  );
}
