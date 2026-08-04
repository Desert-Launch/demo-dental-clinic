import { addDays } from "date-fns";

import { hoursForWeekday } from "@/lib/site";
import { formatMinutesOfDay } from "@/lib/utils";

export interface ClinicStatus {
  open: boolean;
  label: string;
}

function nextOpening(from: Date): { label: string; opens: number } | null {
  for (let offset = 1; offset <= 7; offset += 1) {
    const day = addDays(from, offset);
    const hours = hoursForWeekday(day.getDay());
    if (hours.opens !== null) {
      return {
        label: offset === 1 ? "tomorrow" : hours.label,
        opens: hours.opens,
      };
    }
  }
  return null;
}

/** Reads the current time against the published hours. Client-side only. */
export function getClinicStatus(now: Date): ClinicStatus {
  const hours = hoursForWeekday(now.getDay());
  const minutes = now.getHours() * 60 + now.getMinutes();
  const next = nextOpening(now);
  const nextLabel = next
    ? `opens ${next.label} at ${formatMinutesOfDay(next.opens)}`
    : "opens soon";

  if (hours.opens === null || hours.closes === null) {
    return { open: false, label: `Closed today — ${nextLabel}` };
  }

  if (minutes < hours.opens) {
    return { open: false, label: `Opens at ${formatMinutesOfDay(hours.opens)}` };
  }

  if (minutes >= hours.closes) {
    return { open: false, label: `Closed now — ${nextLabel}` };
  }

  if (
    hours.breakStart !== undefined &&
    hours.breakEnd !== undefined &&
    minutes >= hours.breakStart &&
    minutes < hours.breakEnd
  ) {
    return { open: false, label: `On a break — back at ${formatMinutesOfDay(hours.breakEnd)}` };
  }

  return { open: true, label: `Open until ${formatMinutesOfDay(hours.closes)}` };
}
