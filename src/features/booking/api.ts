import { addDays, addMinutes, format, parseISO, startOfDay } from "date-fns";

import { NO_PREFERENCE, type BookingDetailsValues } from "@/features/booking/schema";
import { toStoredInsurer } from "@/features/patients";
import {
  BOOKING_HORIZON_DAYS,
  candidateSlotStarts,
  intervalsOverlap,
  isClinicOpenOn,
  minutesToDate,
} from "@/lib/scheduling";
import {
  createAppointment,
  createPatient,
  findPatientByEmail,
  getServiceById,
  listChairBookings,
  listDentistsForService,
  sleep,
  StoreError,
} from "@/lib/store";
import type { AppointmentWithRelations, Dentist, Service } from "@/types";

const LATENCY_MS = 120;
const WRITE_LATENCY_MS = 320;

/** Nothing bookable inside the next two hours — the front desk needs warning. */
export const MIN_LEAD_MINUTES = 120;

export interface SlotOption {
  startMinutes: number;
  available: boolean;
  /** Dentists free for this slot, in team order. */
  dentistIds: string[];
}

export interface DayOption {
  /** `yyyy-MM-dd`. */
  date: string;
  weekday: string;
  dayOfMonth: string;
  month: string;
  open: boolean;
  availableCount: number;
}

export interface AvailabilityQuery {
  serviceId: string;
  /** A dentist id, or `NO_PREFERENCE`. */
  dentistId: string;
}

function resolveService(serviceId: string): Service {
  const service = getServiceById(serviceId);
  if (!service) throw new StoreError("That treatment is no longer offered.");
  return service;
}

function resolvePool(service: Service, dentistId: string): Dentist[] {
  const eligible = listDentistsForService(service.id);
  if (dentistId === NO_PREFERENCE) return eligible;
  return eligible.filter((dentist) => dentist.id === dentistId);
}

/** Availability is derived from the store, never stored: bookings block chairs. */
function computeDaySlots(day: Date, service: Service, pool: Dentist[]): SlotOption[] {
  const working = pool.filter((dentist) => dentist.workingDays.includes(day.getDay()));
  if (working.length === 0) return [];

  const bookingsByDentist = new Map(
    working.map((dentist) => [dentist.id, listChairBookings(dentist.id, day)]),
  );
  const earliest = addMinutes(new Date(), MIN_LEAD_MINUTES);

  return candidateSlotStarts(day, service.durationMinutes).map((startMinutes) => {
    const startsAt = minutesToDate(day, startMinutes);
    if (startsAt < earliest) {
      return { startMinutes, available: false, dentistIds: [] };
    }

    const freeDentists = working.filter((dentist) => {
      const bookings = bookingsByDentist.get(dentist.id) ?? [];
      return !bookings.some((booking) =>
        intervalsOverlap(
          new Date(booking.startsAt),
          booking.durationMinutes,
          startsAt,
          service.durationMinutes,
        ),
      );
    });

    return {
      startMinutes,
      available: freeDentists.length > 0,
      dentistIds: freeDentists.map((dentist) => dentist.id),
    };
  });
}

export async function fetchAvailableDays(query: AvailabilityQuery): Promise<DayOption[]> {
  await sleep(LATENCY_MS);
  const service = resolveService(query.serviceId);
  const pool = resolvePool(service, query.dentistId);
  const today = startOfDay(new Date());

  return Array.from({ length: BOOKING_HORIZON_DAYS }, (_, offset) => {
    const day = addDays(today, offset);
    const open = isClinicOpenOn(day);
    const slots = open ? computeDaySlots(day, service, pool) : [];
    return {
      date: format(day, "yyyy-MM-dd"),
      weekday: format(day, "EEE"),
      dayOfMonth: format(day, "d"),
      month: format(day, "MMM"),
      open,
      availableCount: slots.filter((slot) => slot.available).length,
    };
  });
}

export async function fetchDaySlots(
  query: AvailabilityQuery & { date: string },
): Promise<SlotOption[]> {
  await sleep(LATENCY_MS);
  const service = resolveService(query.serviceId);
  const pool = resolvePool(service, query.dentistId);
  return computeDaySlots(parseISO(query.date), service, pool);
}

export interface NextAvailable {
  date: string;
  startMinutes: number;
  dentistId: string;
  serviceId: string;
}

/** Powers the "next available" card in the hero, straight from the store. */
export async function fetchNextAvailable(
  serviceId = "svc_check_up",
): Promise<NextAvailable | null> {
  await sleep(LATENCY_MS);
  const service = resolveService(serviceId);
  const pool = resolvePool(service, NO_PREFERENCE);
  const today = startOfDay(new Date());

  for (let offset = 0; offset < BOOKING_HORIZON_DAYS; offset += 1) {
    const day = addDays(today, offset);
    if (!isClinicOpenOn(day)) continue;
    const slot = computeDaySlots(day, service, pool).find((option) => option.available);
    const dentistId = slot?.dentistIds[0];
    if (slot && dentistId) {
      return {
        date: format(day, "yyyy-MM-dd"),
        startMinutes: slot.startMinutes,
        dentistId,
        serviceId: service.id,
      };
    }
  }
  return null;
}

export interface SubmitBookingInput {
  serviceId: string;
  dentistId: string;
  date: string;
  startMinutes: number;
  details: BookingDetailsValues;
}

export interface BookingResult {
  appointment: AppointmentWithRelations;
  /** True when this booking also created the patient record. */
  isNewPatient: boolean;
}

export async function submitBooking(input: SubmitBookingInput): Promise<BookingResult> {
  await sleep(WRITE_LATENCY_MS);

  const service = resolveService(input.serviceId);
  const startsAt = minutesToDate(parseISO(input.date), input.startMinutes);
  const pool = resolvePool(service, input.dentistId);

  const slot = computeDaySlots(parseISO(input.date), service, pool).find(
    (option) => option.startMinutes === input.startMinutes,
  );
  if (!slot?.available) {
    throw new StoreError(
      "That slot was taken while you were filling in your details. Pick another time.",
    );
  }

  const dentistId = slot.dentistIds[0];
  if (!dentistId) {
    throw new StoreError("No dentist is free at that time. Pick another slot.");
  }

  const existing = findPatientByEmail(input.details.email);
  const patient =
    existing ??
    createPatient({
      firstName: input.details.firstName,
      lastName: input.details.lastName,
      email: input.details.email,
      phone: input.details.phone,
      dateOfBirth: input.details.dateOfBirth,
      insurer: toStoredInsurer(input.details.insurer),
      notes: "",
    });

  const appointment = createAppointment({
    patientId: patient.id,
    dentistId,
    serviceId: service.id,
    startsAt: startsAt.toISOString(),
    status: "scheduled",
    channel: "online",
    notes: input.details.reason,
  });

  return { appointment, isNewPatient: existing === null };
}
