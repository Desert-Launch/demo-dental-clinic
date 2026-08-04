import { z } from "zod";

import { patientFormSchema } from "@/features/patients/schema";

/** Step 1 — treatment. */
export const treatmentStepSchema = z.object({
  serviceId: z.string().min(1, "Choose a treatment to continue."),
});

/** Step 2 — dentist. `any` means "no preference", assigned at confirmation. */
export const NO_PREFERENCE = "any";

export const dentistStepSchema = z.object({
  dentistId: z.string().min(1, "Choose a dentist, or pick no preference."),
});

/** Step 3 — slot. */
export const slotStepSchema = z.object({
  /** `yyyy-MM-dd`. */
  date: z.string().min(1, "Pick a day."),
  /** Minutes from midnight. */
  startMinutes: z.number().int().nonnegative(),
});

/** Step 4 — the patient's own details. */
export const bookingDetailsSchema = patientFormSchema
  .pick({ firstName: true, lastName: true, email: true, phone: true, dateOfBirth: true })
  .extend({
    insurer: z.string(),
    reason: z.string().max(500, "Keep this under 500 characters."),
    consent: z.literal(true, {
      message: "Tick the box so we can hold your appointment.",
    }),
  });

export type BookingDetailsValues = z.infer<typeof bookingDetailsSchema>;

export const bookingSteps = ["treatment", "dentist", "slot", "details", "done"] as const;
export type BookingStep = (typeof bookingSteps)[number];

export const bookingStepMeta: Record<
  BookingStep,
  { title: string; caption: string }
> = {
  treatment: { title: "Treatment", caption: "What are you coming in for?" },
  dentist: { title: "Dentist", caption: "Anyone in mind?" },
  slot: { title: "Time", caption: "Pick a day that suits you." },
  details: { title: "Your details", caption: "So we know who to expect." },
  done: { title: "Confirmed", caption: "You're booked in." },
};
