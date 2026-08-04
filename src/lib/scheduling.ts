import { addMinutes, isSameDay, startOfDay } from "date-fns";

import { hoursForWeekday, type ClinicDay } from "@/lib/site";

/** The booking grid: every slot starts on a half hour. */
export const SLOT_STEP_MINUTES = 30;

/** How far ahead patients may book. */
export const BOOKING_HORIZON_DAYS = 21;

export type TimeOfDay = "morning" | "afternoon" | "evening";

export function clinicDayFor(date: Date): ClinicDay {
  return hoursForWeekday(date.getDay());
}

export function isClinicOpenOn(date: Date): boolean {
  const day = clinicDayFor(date);
  return day.opens !== null && day.closes !== null;
}

/** Minutes from midnight → a `Date` on the same calendar day. */
export function minutesToDate(day: Date, minutes: number): Date {
  return addMinutes(startOfDay(day), minutes);
}

export function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function timeOfDay(minutes: number): TimeOfDay {
  if (minutes < 12 * 60) return "morning";
  if (minutes < 17 * 60) return "afternoon";
  return "evening";
}

export const timeOfDayLabels: Record<TimeOfDay, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

/**
 * Every slot start on `date` where a treatment of `durationMinutes` fits inside
 * opening hours without running through the midday break.
 */
export function candidateSlotStarts(date: Date, durationMinutes: number): number[] {
  const day = clinicDayFor(date);
  if (day.opens === null || day.closes === null) return [];

  const starts: number[] = [];
  for (
    let start = day.opens;
    start + durationMinutes <= day.closes;
    start += SLOT_STEP_MINUTES
  ) {
    const end = start + durationMinutes;
    const clashesWithBreak =
      day.breakStart !== undefined &&
      day.breakEnd !== undefined &&
      start < day.breakEnd &&
      end > day.breakStart;
    if (!clashesWithBreak) starts.push(start);
  }
  return starts;
}

/** Half-open interval overlap: [startA, endA) vs [startB, endB). */
export function intervalsOverlap(
  startA: Date,
  durationA: number,
  startB: Date,
  durationB: number,
): boolean {
  const endA = addMinutes(startA, durationA).getTime();
  const endB = addMinutes(startB, durationB).getTime();
  return startA.getTime() < endB && startB.getTime() < endA;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return isSameDay(a, b);
}
