"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { ArrowRight, CalendarCheck, Star } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { ArchPanel } from "@/components/shared/gradient-art";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDentists } from "@/features/dentists";
import { useNextAvailable } from "@/features/booking";
import { getClinicStatus } from "@/lib/clinic-status";
import { cn, formatMinutesOfDay } from "@/lib/utils";

const trustPoints = [
  { value: "4.9", label: "average from 380 reviews" },
  { value: "6,400+", label: "patients since 2012" },
  { value: "Same day", label: "emergency slots most days" },
];

export function Hero() {
  return (
    <section className="wash-brand relative overflow-hidden">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] size-[34rem] rounded-full bg-mint-100/50 blur-3xl"
      />
      <PageContainer className="relative grid items-center gap-14 pt-8 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:pt-16 lg:pb-28">
        <div>
          <Reveal>
            <OpenStatusPill />
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="mt-6 max-w-[15ch] text-display-1 text-ink-950">
              Dentistry that feels calm from the first visit.
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-6 max-w-xl text-lead text-ink-700">
              General, cosmetic and orthodontic care in Jumeirah. Unhurried
              appointments, a written price before anything starts, and a dentist who
              explains what they are doing while they do it.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="xl">
                <Link href="/book">
                  Book appointment
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link href="/services">See treatments and prices</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-6">
              {trustPoints.map((point, index) => (
                <div key={point.label} className="flex items-baseline gap-2.5">
                  {index === 0 ? (
                    <Star
                      className="size-4 shrink-0 translate-y-0.5 fill-sand-400 text-sand-500"
                      aria-hidden
                    />
                  ) : null}
                  <div>
                    <dt
                      data-numeric
                      className="font-display text-subtitle font-semibold text-ink-900"
                    >
                      {point.value}
                    </dt>
                    <dd className="text-small text-ink-600">{point.label}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={0.1} y={26} className="relative mx-auto w-full max-w-md lg:max-w-none">
          <ArchPanel className="aspect-[4/5] w-full" />
          <NextAvailableCard />
        </Reveal>
      </PageContainer>
    </section>
  );
}

function OpenStatusPill() {
  // Clock-dependent, so it renders after mount rather than mismatching the SSR
  // markup.
  const [status, setStatus] = useState<ReturnType<typeof getClinicStatus> | null>(null);

  useEffect(() => {
    setStatus(getClinicStatus(new Date()));
    const timer = window.setInterval(() => setStatus(getClinicStatus(new Date())), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <p
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-full border border-border bg-surface/70 px-3.5 text-small font-medium text-ink-700 backdrop-blur",
        !status && "opacity-0",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-2 rounded-full",
          status?.open ? "bg-success-500" : "bg-sand-500",
        )}
      />
      {status?.label ?? "Checking opening hours"}
    </p>
  );
}

function NextAvailableCard() {
  const { data: slot, isLoading } = useNextAvailable();
  const { data: dentists } = useDentists();
  const dentist = dentists?.find((item) => item.id === slot?.dentistId);

  return (
    <div className="absolute -bottom-8 left-1/2 w-[min(22rem,92%)] -translate-x-1/2 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-xl)] lg:left-auto lg:-right-6 lg:translate-x-0">
      <p className="eyebrow">Next available</p>

      {isLoading ? (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-52" />
        </div>
      ) : slot ? (
        <>
          <p className="mt-2 font-display text-title font-semibold text-ink-900">
            {formatSlotDay(slot.date)}, {formatMinutesOfDay(slot.startMinutes)}
          </p>
          <p className="mt-1 text-small text-ink-600">
            Check-up and X-rays with {dentist?.name ?? "an available dentist"}
          </p>
          <Button asChild size="sm" className="mt-4 w-full">
            <Link
              href={`/book?service=check-up&dentist=${slot.dentistId}&date=${slot.date}&time=${slot.startMinutes}`}
            >
              <CalendarCheck aria-hidden />
              Take this slot
            </Link>
          </Button>
        </>
      ) : (
        <>
          <p className="mt-2 text-body text-ink-700">
            The next three weeks are fully booked. Call us and we will find room.
          </p>
          <Button asChild size="sm" variant="outline" className="mt-4 w-full">
            <Link href="/contact">Get in touch</Link>
          </Button>
        </>
      )}
    </div>
  );
}

function formatSlotDay(date: string): string {
  const parsed = parseISO(date);
  if (isToday(parsed)) return "Today";
  if (isTomorrow(parsed)) return "Tomorrow";
  return format(parsed, "EEEE d MMM");
}
