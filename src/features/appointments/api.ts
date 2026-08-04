import {
  addDays,
  eachDayOfInterval,
  endOfDay,
  format,
  isAfter,
  isSameMonth,
  startOfDay,
  subDays,
  subMonths,
} from "date-fns";

import {
  createAppointment,
  deleteAppointment,
  getAppointmentById,
  listAppointments,
  listPatients,
  sleep,
  updateAppointment,
  type AppointmentFilters,
  type CreateAppointmentInput,
  type UpdateAppointmentPatch,
} from "@/lib/store";
import type { AppointmentStatus, AppointmentWithRelations } from "@/types";

const LATENCY_MS = 120;
const WRITE_LATENCY_MS = 260;

export async function fetchAppointments(
  filters: AppointmentFilters = {},
): Promise<AppointmentWithRelations[]> {
  await sleep(LATENCY_MS);
  return listAppointments(filters);
}

export async function fetchAppointment(id: string): Promise<AppointmentWithRelations> {
  await sleep(LATENCY_MS);
  const appointment = getAppointmentById(id);
  if (!appointment) throw new Error("We could not find that appointment.");
  return appointment;
}

export async function createAppointmentRecord(
  input: CreateAppointmentInput,
): Promise<AppointmentWithRelations> {
  await sleep(WRITE_LATENCY_MS);
  return createAppointment(input);
}

export async function updateAppointmentRecord(
  id: string,
  patch: UpdateAppointmentPatch,
): Promise<AppointmentWithRelations> {
  await sleep(WRITE_LATENCY_MS);
  return updateAppointment(id, patch);
}

export async function deleteAppointmentRecord(id: string): Promise<void> {
  await sleep(WRITE_LATENCY_MS);
  deleteAppointment(id);
}

export async function setAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<AppointmentWithRelations> {
  await sleep(WRITE_LATENCY_MS);
  return updateAppointment(id, { status });
}

/**
 * Cancelling is the one call that fails on purpose, roughly once in ten, so the
 * optimistic update and its rollback can be shown during a demo.
 */
export const CANCEL_FAILURE_RATE = 0.1;

export async function cancelAppointment(id: string): Promise<AppointmentWithRelations> {
  await sleep(WRITE_LATENCY_MS);
  if (Math.random() < CANCEL_FAILURE_RATE) {
    throw new Error(
      "The clinic system rejected the cancellation. Nothing changed — try again.",
    );
  }
  return updateAppointment(id, { status: "cancelled" });
}

/* -------------------------------------------------------------------------- */
/* Dashboard overview                                                          */
/* -------------------------------------------------------------------------- */

export interface OverviewPoint {
  date: string;
  label: string;
  booked: number;
  completed: number;
}

export interface OverviewStats {
  todayTotal: number;
  todayRemaining: number;
  upcomingWeek: number;
  noShowRate: number;
  noShowSampleSize: number;
  revenueMonthAED: number;
  revenueChangePct: number | null;
  newPatientsThisMonth: number;
  series: OverviewPoint[];
  today: AppointmentWithRelations[];
}

export async function fetchOverview(): Promise<OverviewStats> {
  await sleep(LATENCY_MS);

  const now = new Date();
  const all = listAppointments();

  const today = all.filter((item) => {
    const startsAt = new Date(item.startsAt);
    return startsAt >= startOfDay(now) && startsAt <= endOfDay(now);
  });

  const upcomingWeek = all.filter((item) => {
    const startsAt = new Date(item.startsAt);
    return (
      isAfter(startsAt, now) &&
      startsAt <= endOfDay(addDays(now, 7)) &&
      (item.status === "scheduled" || item.status === "confirmed")
    );
  }).length;

  const lastThirtyDays = all.filter((item) => {
    const startsAt = new Date(item.startsAt);
    return startsAt >= startOfDay(subDays(now, 30)) && startsAt <= now;
  });
  const attended = lastThirtyDays.filter(
    (item) => item.status === "completed" || item.status === "no-show",
  );
  const noShows = attended.filter((item) => item.status === "no-show").length;

  const revenueMonthAED = all
    .filter(
      (item) => item.status === "completed" && isSameMonth(new Date(item.startsAt), now),
    )
    .reduce((total, item) => total + item.priceAED, 0);

  const previousMonth = subMonths(now, 1);
  const revenuePreviousMonth = all
    .filter(
      (item) =>
        item.status === "completed" &&
        isSameMonth(new Date(item.startsAt), previousMonth) &&
        new Date(item.startsAt) <= subMonths(now, 1),
    )
    .reduce((total, item) => total + item.priceAED, 0);

  const series: OverviewPoint[] = eachDayOfInterval({
    start: startOfDay(subDays(now, 6)),
    end: startOfDay(addDays(now, 7)),
  }).map((day) => {
    const onDay = all.filter((item) => {
      const startsAt = new Date(item.startsAt);
      return startsAt >= startOfDay(day) && startsAt <= endOfDay(day);
    });
    return {
      date: format(day, "yyyy-MM-dd"),
      label: format(day, "EEE d"),
      booked: onDay.filter((item) => item.status !== "cancelled").length,
      completed: onDay.filter((item) => item.status === "completed").length,
    };
  });

  const newPatientsThisMonth = listPatients().filter((patient) =>
    isSameMonth(new Date(patient.createdAt), now),
  ).length;

  return {
    todayTotal: today.length,
    todayRemaining: today.filter(
      (item) =>
        isAfter(new Date(item.startsAt), now) &&
        (item.status === "scheduled" || item.status === "confirmed"),
    ).length,
    upcomingWeek,
    noShowRate: attended.length === 0 ? 0 : noShows / attended.length,
    noShowSampleSize: attended.length,
    revenueMonthAED,
    revenueChangePct:
      revenuePreviousMonth === 0
        ? null
        : ((revenueMonthAED - revenuePreviousMonth) / revenuePreviousMonth) * 100,
    newPatientsThisMonth,
    series,
    today,
  };
}

/** Everything on the books for one dentist on one day, for the schedule view. */
export async function fetchDaySchedule(day: Date): Promise<AppointmentWithRelations[]> {
  await sleep(LATENCY_MS);
  return listAppointments({
    from: startOfDay(day).toISOString(),
    to: endOfDay(day).toISOString(),
  });
}
