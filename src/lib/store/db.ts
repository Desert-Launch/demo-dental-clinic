import { endOfDay, startOfDay } from "date-fns";

import { intervalsOverlap } from "@/lib/scheduling";
import { createId, createReference } from "@/lib/store/ids";
import { buildSeedData } from "@/lib/store/seed";
import {
  patientFullName,
  type Appointment,
  type AppointmentStatus,
  type AppointmentWithRelations,
  type BookingChannel,
  type Dentist,
  type Patient,
  type PatientWithHistory,
  type Service,
} from "@/types";

/**
 * The demo "backend": a module-level singleton holding every record. No React,
 * no persistence — a hard refresh re-seeds. Everything in the app reads and
 * writes through the functions below, never by touching `database` directly.
 */
interface Database {
  services: Service[];
  dentists: Dentist[];
  patients: Patient[];
  appointments: Appointment[];
}

let database: Database = buildSeedData();

/** Thrown for rule violations the UI is expected to surface to the user. */
export class StoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreError";
  }
}

export function resetDatabase(): void {
  database = buildSeedData();
}

/* -------------------------------------------------------------------------- */
/* Services                                                                    */
/* -------------------------------------------------------------------------- */

export function listServices(): Service[] {
  return database.services.map((service) => ({ ...service }));
}

export function getServiceById(id: string): Service | null {
  const service = database.services.find((item) => item.id === id);
  return service ? { ...service } : null;
}

export function getServiceBySlug(slug: string): Service | null {
  const service = database.services.find((item) => item.slug === slug);
  return service ? { ...service } : null;
}

/* -------------------------------------------------------------------------- */
/* Dentists                                                                    */
/* -------------------------------------------------------------------------- */

export function listDentists(): Dentist[] {
  return database.dentists.map((dentist) => ({ ...dentist }));
}

export function getDentistById(id: string): Dentist | null {
  const dentist = database.dentists.find((item) => item.id === id);
  return dentist ? { ...dentist } : null;
}

/** Dentists who perform a given treatment, in display order. */
export function listDentistsForService(serviceId: string): Dentist[] {
  const service = database.services.find((item) => item.id === serviceId);
  if (!service) return [];
  return database.dentists
    .filter((dentist) => dentist.specialties.includes(service.category))
    .map((dentist) => ({ ...dentist }));
}

/* -------------------------------------------------------------------------- */
/* Joins                                                                       */
/* -------------------------------------------------------------------------- */

function hydrate(appointment: Appointment): AppointmentWithRelations | null {
  const patient = database.patients.find((item) => item.id === appointment.patientId);
  const dentist = database.dentists.find((item) => item.id === appointment.dentistId);
  const service = database.services.find((item) => item.id === appointment.serviceId);
  if (!patient || !dentist || !service) return null;
  return {
    ...appointment,
    patient: { ...patient },
    dentist: { ...dentist },
    service: { ...service },
  };
}

/* -------------------------------------------------------------------------- */
/* Appointments                                                                */
/* -------------------------------------------------------------------------- */

export interface AppointmentFilters {
  statuses?: AppointmentStatus[];
  dentistId?: string;
  patientId?: string;
  serviceId?: string;
  /** Matches patient name, booking reference, email or phone. */
  search?: string;
  /** ISO datetimes; the range is inclusive of both days. */
  from?: string;
  to?: string;
}

export function listAppointments(
  filters: AppointmentFilters = {},
): AppointmentWithRelations[] {
  const search = filters.search?.trim().toLowerCase();
  const from = filters.from ? startOfDay(new Date(filters.from)).getTime() : null;
  const to = filters.to ? endOfDay(new Date(filters.to)).getTime() : null;

  return database.appointments
    .map(hydrate)
    .filter((item): item is AppointmentWithRelations => item !== null)
    .filter((item) => {
      if (filters.statuses?.length && !filters.statuses.includes(item.status)) return false;
      if (filters.dentistId && item.dentistId !== filters.dentistId) return false;
      if (filters.patientId && item.patientId !== filters.patientId) return false;
      if (filters.serviceId && item.serviceId !== filters.serviceId) return false;

      const startsAt = new Date(item.startsAt).getTime();
      if (from !== null && startsAt < from) return false;
      if (to !== null && startsAt > to) return false;

      if (search) {
        const haystack = [
          patientFullName(item.patient),
          item.reference,
          item.patient.email,
          item.patient.phone,
          item.service.name,
          item.dentist.name,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }

      return true;
    })
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}

export function getAppointmentById(id: string): AppointmentWithRelations | null {
  const appointment = database.appointments.find((item) => item.id === id);
  return appointment ? hydrate(appointment) : null;
}

export interface CreateAppointmentInput {
  patientId: string;
  dentistId: string;
  serviceId: string;
  startsAt: string;
  status?: AppointmentStatus;
  channel?: BookingChannel;
  notes?: string;
}

/** A chair is taken unless the booking on it was cancelled. */
function blocksChair(status: AppointmentStatus): boolean {
  return status !== "cancelled";
}

function assertChairIsFree(
  dentistId: string,
  startsAt: Date,
  durationMinutes: number,
  ignoreAppointmentId?: string,
): void {
  const dentist = database.dentists.find((item) => item.id === dentistId);
  const clash = database.appointments.find(
    (item) =>
      item.id !== ignoreAppointmentId &&
      item.dentistId === dentistId &&
      blocksChair(item.status) &&
      intervalsOverlap(
        new Date(item.startsAt),
        item.durationMinutes,
        startsAt,
        durationMinutes,
      ),
  );
  if (clash) {
    throw new StoreError(
      `${dentist?.name ?? "That dentist"} already has a booking that overlaps this time. Pick another slot.`,
    );
  }
}

export function createAppointment(input: CreateAppointmentInput): AppointmentWithRelations {
  const service = database.services.find((item) => item.id === input.serviceId);
  if (!service) throw new StoreError("That treatment is no longer offered.");
  const dentist = database.dentists.find((item) => item.id === input.dentistId);
  if (!dentist) throw new StoreError("That dentist is not on the team.");
  const patient = database.patients.find((item) => item.id === input.patientId);
  if (!patient) throw new StoreError("We could not find that patient record.");

  const startsAt = new Date(input.startsAt);
  assertChairIsFree(dentist.id, startsAt, service.durationMinutes);

  const now = new Date().toISOString();
  const appointment: Appointment = {
    id: createId(),
    reference: createReference(),
    patientId: patient.id,
    dentistId: dentist.id,
    serviceId: service.id,
    startsAt: startsAt.toISOString(),
    durationMinutes: service.durationMinutes,
    status: input.status ?? "scheduled",
    channel: input.channel ?? "online",
    notes: input.notes ?? "",
    priceAED: service.priceAED,
    createdAt: now,
    updatedAt: now,
  };

  database.appointments.push(appointment);
  const hydrated = hydrate(appointment);
  if (!hydrated) throw new StoreError("The appointment could not be saved.");
  return hydrated;
}

export interface UpdateAppointmentPatch {
  dentistId?: string;
  serviceId?: string;
  startsAt?: string;
  status?: AppointmentStatus;
  channel?: BookingChannel;
  notes?: string;
}

export function updateAppointment(
  id: string,
  patch: UpdateAppointmentPatch,
): AppointmentWithRelations {
  const index = database.appointments.findIndex((item) => item.id === id);
  const current = database.appointments[index];
  if (index === -1 || !current) {
    throw new StoreError("That appointment no longer exists. Refresh and try again.");
  }

  const serviceId = patch.serviceId ?? current.serviceId;
  const service = database.services.find((item) => item.id === serviceId);
  if (!service) throw new StoreError("That treatment is no longer offered.");

  const dentistId = patch.dentistId ?? current.dentistId;
  if (!database.dentists.some((item) => item.id === dentistId)) {
    throw new StoreError("That dentist is not on the team.");
  }

  const startsAt = new Date(patch.startsAt ?? current.startsAt);
  const status = patch.status ?? current.status;

  if (blocksChair(status)) {
    assertChairIsFree(dentistId, startsAt, service.durationMinutes, id);
  }

  const updated: Appointment = {
    ...current,
    dentistId,
    serviceId,
    startsAt: startsAt.toISOString(),
    durationMinutes: service.durationMinutes,
    priceAED: service.priceAED,
    status,
    channel: patch.channel ?? current.channel,
    notes: patch.notes ?? current.notes,
    updatedAt: new Date().toISOString(),
  };

  database.appointments[index] = updated;
  const hydrated = hydrate(updated);
  if (!hydrated) throw new StoreError("The appointment could not be saved.");
  return hydrated;
}

export function deleteAppointment(id: string): void {
  const index = database.appointments.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new StoreError("That appointment no longer exists.");
  }
  database.appointments.splice(index, 1);
}

/** Bookings that block a chair for one dentist on one calendar day. */
export function listChairBookings(dentistId: string, day: Date): Appointment[] {
  const dayStart = startOfDay(day).getTime();
  const dayEnd = endOfDay(day).getTime();
  return database.appointments
    .filter((item) => item.dentistId === dentistId && blocksChair(item.status))
    .filter((item) => {
      const startsAt = new Date(item.startsAt).getTime();
      return startsAt >= dayStart && startsAt <= dayEnd;
    })
    .map((item) => ({ ...item }));
}

/* -------------------------------------------------------------------------- */
/* Patients                                                                    */
/* -------------------------------------------------------------------------- */

export interface PatientFilters {
  /** Matches name, email or phone. */
  search?: string;
  insurer?: string;
}

function withHistory(patient: Patient, now = new Date()): PatientWithHistory {
  const appointments = database.appointments
    .filter((item) => item.patientId === patient.id)
    .map(hydrate)
    .filter((item): item is AppointmentWithRelations => item !== null)
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());

  const past = appointments.filter(
    (item) => new Date(item.startsAt) <= now && item.status === "completed",
  );
  const upcoming = appointments
    .filter(
      (item) =>
        new Date(item.startsAt) > now &&
        (item.status === "scheduled" || item.status === "confirmed"),
    )
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  return {
    ...patient,
    appointments,
    lastVisitAt: past[0]?.startsAt ?? null,
    nextVisitAt: upcoming[0]?.startsAt ?? null,
    totalSpendAED: past.reduce((total, item) => total + item.priceAED, 0),
  };
}

export function listPatients(filters: PatientFilters = {}): PatientWithHistory[] {
  const search = filters.search?.trim().toLowerCase();
  return database.patients
    .filter((patient) => {
      if (filters.insurer && patient.insurer !== filters.insurer) return false;
      if (!search) return true;
      const haystack = [patientFullName(patient), patient.email, patient.phone]
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    })
    .map((patient) => withHistory(patient))
    .sort((a, b) =>
      patientFullName(a).localeCompare(patientFullName(b), "en", { sensitivity: "base" }),
    );
}

export function getPatientById(id: string): PatientWithHistory | null {
  const patient = database.patients.find((item) => item.id === id);
  return patient ? withHistory(patient) : null;
}

export function findPatientByEmail(email: string): Patient | null {
  const match = database.patients.find(
    (item) => item.email.toLowerCase() === email.trim().toLowerCase(),
  );
  return match ? { ...match } : null;
}

export interface CreatePatientInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  insurer?: string | null;
  notes?: string;
}

export function createPatient(input: CreatePatientInput): PatientWithHistory {
  const existing = database.patients.find(
    (item) => item.email.toLowerCase() === input.email.trim().toLowerCase(),
  );
  if (existing) {
    throw new StoreError(
      `${patientFullName(existing)} already uses that email address. Open their record instead.`,
    );
  }

  const patient: Patient = {
    id: createId(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    dateOfBirth: input.dateOfBirth,
    insurer: input.insurer ?? null,
    notes: input.notes ?? "",
    createdAt: new Date().toISOString(),
  };

  database.patients.push(patient);
  return withHistory(patient);
}

export type UpdatePatientPatch = Partial<CreatePatientInput>;

export function updatePatient(id: string, patch: UpdatePatientPatch): PatientWithHistory {
  const index = database.patients.findIndex((item) => item.id === id);
  const current = database.patients[index];
  if (index === -1 || !current) {
    throw new StoreError("That patient record no longer exists.");
  }

  if (patch.email) {
    const duplicate = database.patients.find(
      (item) =>
        item.id !== id && item.email.toLowerCase() === patch.email!.trim().toLowerCase(),
    );
    if (duplicate) {
      throw new StoreError(
        `${patientFullName(duplicate)} already uses that email address.`,
      );
    }
  }

  const updated: Patient = {
    ...current,
    ...patch,
    insurer: patch.insurer === undefined ? current.insurer : patch.insurer,
    email: patch.email?.trim() ?? current.email,
    firstName: patch.firstName?.trim() ?? current.firstName,
    lastName: patch.lastName?.trim() ?? current.lastName,
    phone: patch.phone?.trim() ?? current.phone,
  };

  database.patients[index] = updated;
  return withHistory(updated);
}

/** Removing a patient removes their appointments — the UI warns about this. */
export function deletePatient(id: string): void {
  const index = database.patients.findIndex((item) => item.id === id);
  if (index === -1) throw new StoreError("That patient record no longer exists.");
  database.patients.splice(index, 1);
  database.appointments = database.appointments.filter((item) => item.patientId !== id);
}

/* -------------------------------------------------------------------------- */
/* Demo helpers                                                                */
/* -------------------------------------------------------------------------- */

export function countRecords() {
  return {
    services: database.services.length,
    dentists: database.dentists.length,
    patients: database.patients.length,
    appointments: database.appointments.length,
  };
}

/** Lets `api.ts` simulate network latency so loading states are demoable. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
