"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowRight,
  Banknote,
  CalendarClock,
  CalendarDays,
  UserX,
} from "lucide-react";

import { StatCard, StatCardSkeleton } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AppointmentsChart } from "@/features/appointments/components/appointments-chart";
import { ScheduleList } from "@/features/appointments/components/schedule-list";
import { useOverview } from "@/features/appointments";
import { useDentists } from "@/features/dentists";
import { useSessionStore } from "@/lib/state/session-store";
import { formatAED, pluralise } from "@/lib/utils";

export function OverviewDashboard() {
  const { data: overview, isLoading } = useOverview();
  const { data: dentists } = useDentists();
  const staffId = useSessionStore((state) => state.staffId);
  const staff = dentists?.find((dentist) => dentist.id === staffId);
  const greeting = useGreeting();

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="mx-auto max-w-[76rem]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Overview</p>
          <h1 className="mt-2 text-display-3 text-ink-950">
            {greeting}
            {staff ? `, ${staff.name}` : ""}
          </h1>
          <p className="mt-2 text-body text-ink-600">
            Here is how the studio is running today.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/appointments">
            Open the diary
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading || !overview ? (
          Array.from({ length: 4 }, (_, index) => <StatCardSkeleton key={index} />)
        ) : (
          <>
            <StatCard
              label="Today’s appointments"
              value={String(overview.todayTotal)}
              hint={
                overview.todayTotal === 0
                  ? "Nothing booked in"
                  : `${overview.todayRemaining} still to come`
              }
              icon={CalendarDays}
            />
            <StatCard
              label="Next seven days"
              value={String(overview.upcomingWeek)}
              hint={`${pluralise(overview.upcomingWeek, "appointment", "appointments")} on the books`}
              icon={CalendarClock}
            />
            <StatCard
              label="No-show rate"
              value={`${Math.round(overview.noShowRate * 100)}%`}
              hint={`last 30 days · ${overview.noShowSampleSize} visits`}
              icon={UserX}
            />
            <StatCard
              label="Revenue this month"
              value={formatAED(overview.revenueMonthAED)}
              hint="completed treatments"
              icon={Banknote}
              trend={overview.revenueChangePct}
            />
          </>
        )}
      </div>

      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[1.35fr_1fr]">
        <section className="min-w-0 rounded-xl border border-border bg-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-subtitle font-semibold text-ink-900">
                Appointments per day
              </h2>
              <p className="mt-1 text-small text-ink-600">
                Last week and the week ahead, cancellations excluded.
              </p>
            </div>
            <ul className="flex items-center gap-4 text-small text-ink-600">
              <li className="flex items-center gap-2">
                <span aria-hidden className="size-2.5 rounded-sm bg-brand-600" />
                Past
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden className="size-2.5 rounded-sm bg-brand-300" />
                Ahead
              </li>
            </ul>
          </div>

          <div className="mt-6">
            {isLoading || !overview ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : (
              <AppointmentsChart data={overview.series} today={today} />
            )}
          </div>
        </section>

        <section className="min-w-0 rounded-xl border border-border bg-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-subtitle font-semibold text-ink-900">
                Today’s schedule
              </h2>
              <p className="mt-1 text-small text-ink-600">
                {format(new Date(), "EEEE d MMMM")}
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/appointments">See all</Link>
            </Button>
          </div>

          <div className="mt-5">
            <ScheduleList
              appointments={overview?.today}
              isLoading={isLoading}
              emptyAction={
                <Button asChild>
                  <Link href="/admin/appointments">Open the diary</Link>
                </Button>
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function useGreeting() {
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");
  }, []);

  return greeting;
}
