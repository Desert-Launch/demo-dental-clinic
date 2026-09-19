import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const aedFormatter = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  maximumFractionDigits: 0,
});

/** `1200` → `AED 1,200`. */
export function formatAED(amount: number): string {
  return aedFormatter.format(amount).replace(/^AED\s*/, "AED ");
}

/** `90` → `1 hr 30 min`. */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hourLabel = `${hours} hr`;
  return rest === 0 ? hourLabel : `${hourLabel} ${rest} min`;
}

/** Minutes from midnight → `2:30 pm`. */
export function formatMinutesOfDay(minutes: number): string {
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const suffix = hours24 >= 12 ? "pm" : "am";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(mins).padStart(2, "0")} ${suffix}`;
}

/** A `Date` → `9:00 am`, matching `formatMinutesOfDay`. */
export function formatTime(date: Date): string {
  return formatMinutesOfDay(date.getHours() * 60 + date.getMinutes());
}

/** `Patient 1` → `P1`. */
export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Deterministic 0–1 value from a string, for stable placeholder art. */
export function hashToUnit(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash % 1000) / 1000;
}

export function pluralise(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}
