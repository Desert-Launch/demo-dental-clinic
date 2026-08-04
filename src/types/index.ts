/**
 * Cross-feature entity types. Feature-local input types are derived from zod
 * schemas inside each feature's `schema.ts`.
 */

export const serviceCategories = [
  "general",
  "cosmetic",
  "orthodontics",
  "surgery",
] as const;

export type ServiceCategory = (typeof serviceCategories)[number];

export const serviceCategoryLabels: Record<ServiceCategory, string> = {
  general: "General",
  cosmetic: "Cosmetic",
  orthodontics: "Orthodontics",
  surgery: "Surgery",
};

export interface Service {
  id: string;
  slug: string;
  name: string;
  category: ServiceCategory;
  /** One line, patient-facing, no jargon. */
  summary: string;
  description: string;
  priceAED: number;
  /** Qualifier shown next to the price, e.g. "per tooth". */
  priceNote?: string;
  durationMinutes: number;
  popular: boolean;
  includes: string[];
}

export interface Dentist {
  id: string;
  name: string;
  role: string;
  credentials: string;
  bio: string;
  languages: string[];
  specialties: ServiceCategory[];
  yearsExperience: number;
  /** Weekdays worked, matching `Date.getDay()` (0 = Sunday). */
  workingDays: number[];
  /** Chooses the gradient used for the portrait placeholder. */
  portrait: 1 | 2 | 3 | 4;
}

export const appointmentStatuses = [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
  "no-show",
] as const;

export type AppointmentStatus = (typeof appointmentStatuses)[number];

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  "no-show": "No-show",
};

export const bookingChannels = ["online", "phone", "walk-in"] as const;
export type BookingChannel = (typeof bookingChannels)[number];

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** ISO date, `yyyy-MM-dd`. */
  dateOfBirth: string;
  insurer: string | null;
  /** Free-text clinical and front-desk notes. Editable in the admin drawer. */
  notes: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  /** Human-readable booking reference, e.g. `ND-7QK4M`. */
  reference: string;
  patientId: string;
  dentistId: string;
  serviceId: string;
  /** ISO datetime of the slot start. */
  startsAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  channel: BookingChannel;
  notes: string;
  priceAED: number;
  createdAt: string;
  updatedAt: string;
}

/** An appointment joined with the records the UI always needs alongside it. */
export interface AppointmentWithRelations extends Appointment {
  patient: Patient;
  dentist: Dentist;
  service: Service;
}

/** A patient joined with their appointment history, newest first. */
export interface PatientWithHistory extends Patient {
  appointments: AppointmentWithRelations[];
  lastVisitAt: string | null;
  nextVisitAt: string | null;
  totalSpendAED: number;
}

export function patientFullName(patient: Pick<Patient, "firstName" | "lastName">): string {
  return `${patient.firstName} ${patient.lastName}`;
}
