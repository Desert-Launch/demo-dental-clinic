/**
 * Clinic facts used across marketing, booking and admin. Fictional throughout.
 */
export const site = {
  name: "Demo Dental Clinic",
  nameArabic: "عيادة أسنان تجريبية",
  shortName: "Demo Dental",
  tagline: "Dentistry that feels calm from the first visit.",
  description:
    "A Dubai dental studio for general, cosmetic, orthodontic and surgical care. Book online in under a minute.",
  // Deliberately undialable: a demo must never ring a real line.
  phone: "+971 4 555 0xxx",
  phoneHref: "/contact",
  whatsapp: "+971 50 555 0xxx",
  email: "hello@example.com",
  address: {
    line1: "1 Demo Street",
    line2: "Demo District, Dubai",
    country: "United Arab Emirates",
  },
  parking: "Free parking on site",
  metro: "A short walk from the metro",
  established: 2012,
} as const;

export type ClinicDay = {
  /** 0 = Sunday, matching `Date.getDay()`. */
  weekday: number;
  label: string;
  shortLabel: string;
  /** Minutes from midnight. `null` when the clinic is closed that day. */
  opens: number | null;
  closes: number | null;
  /** Midday break — the chairs are empty, so no slots are offered. */
  breakStart?: number;
  breakEnd?: number;
  note?: string;
};

/** Gulf week: Friday opens after midday prayers, Sunday is the quiet day. */
export const clinicHours: ClinicDay[] = [
  {
    weekday: 1,
    label: "Monday",
    shortLabel: "Mon",
    opens: 9 * 60,
    closes: 21 * 60,
    breakStart: 13 * 60 + 30,
    breakEnd: 14 * 60 + 30,
  },
  {
    weekday: 2,
    label: "Tuesday",
    shortLabel: "Tue",
    opens: 9 * 60,
    closes: 21 * 60,
    breakStart: 13 * 60 + 30,
    breakEnd: 14 * 60 + 30,
  },
  {
    weekday: 3,
    label: "Wednesday",
    shortLabel: "Wed",
    opens: 9 * 60,
    closes: 21 * 60,
    breakStart: 13 * 60 + 30,
    breakEnd: 14 * 60 + 30,
  },
  {
    weekday: 4,
    label: "Thursday",
    shortLabel: "Thu",
    opens: 9 * 60,
    closes: 21 * 60,
    breakStart: 13 * 60 + 30,
    breakEnd: 14 * 60 + 30,
  },
  {
    weekday: 5,
    label: "Friday",
    shortLabel: "Fri",
    opens: 14 * 60,
    closes: 21 * 60,
    note: "Afternoons only",
  },
  {
    weekday: 6,
    label: "Saturday",
    shortLabel: "Sat",
    opens: 10 * 60,
    closes: 18 * 60,
  },
  {
    weekday: 0,
    label: "Sunday",
    shortLabel: "Sun",
    opens: null,
    closes: null,
    note: "Closed",
  },
];

export function hoursForWeekday(weekday: number): ClinicDay {
  const day = clinicHours.find((entry) => entry.weekday === weekday);
  if (!day) throw new Error(`No clinic hours defined for weekday ${weekday}`);
  return day;
}

export const marketingNav = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Treatments" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
