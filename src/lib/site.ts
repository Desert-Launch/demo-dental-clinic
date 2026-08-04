/**
 * Clinic facts used across marketing, booking and admin. Fictional throughout.
 */
export const site = {
  name: "Nile Dental Studio",
  nameArabic: "استوديو النيل لطب الأسنان",
  shortName: "Nile Dental",
  tagline: "Dentistry that feels calm from the first visit.",
  description:
    "A Dubai dental studio for general, cosmetic, orthodontic and surgical care. Book online in under a minute.",
  phone: "+971 4 555 0142",
  phoneHref: "tel:+97145550142",
  whatsapp: "+971 50 555 0142",
  email: "hello@niledental.ae",
  address: {
    line1: "Unit 12, Al Wasl Road",
    line2: "Jumeirah 1, Dubai",
    country: "United Arab Emirates",
  },
  parking: "Free underground parking, level B1",
  metro: "8 minutes from Business Bay metro",
  established: 2012,
} as const;

export type ClinicDay = {
  /** 0 = Sunday, matching `Date.getDay()`. */
  weekday: number;
  label: string;
  /** Minutes from midnight. `null` when the clinic is closed that day. */
  opens: number | null;
  closes: number | null;
  note?: string;
};

/** Gulf week: Friday opens after midday prayers, Sunday is the quiet day. */
export const clinicHours: ClinicDay[] = [
  { weekday: 1, label: "Monday", opens: 9 * 60, closes: 21 * 60 },
  { weekday: 2, label: "Tuesday", opens: 9 * 60, closes: 21 * 60 },
  { weekday: 3, label: "Wednesday", opens: 9 * 60, closes: 21 * 60 },
  { weekday: 4, label: "Thursday", opens: 9 * 60, closes: 21 * 60 },
  {
    weekday: 5,
    label: "Friday",
    opens: 14 * 60,
    closes: 21 * 60,
    note: "Afternoons only",
  },
  { weekday: 6, label: "Saturday", opens: 10 * 60, closes: 18 * 60 },
  { weekday: 0, label: "Sunday", opens: null, closes: null, note: "Closed" },
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
