import { z } from "zod";

import { appointmentStatuses, bookingChannels } from "@/types";

export const appointmentStatusSchema = z.enum(appointmentStatuses);
export const bookingChannelSchema = z.enum(bookingChannels);

/** The admin create/edit form. Date and time stay separate for the UI. */
export const appointmentFormSchema = z.object({
  patientId: z.string().min(1, "Choose a patient."),
  serviceId: z.string().min(1, "Choose a treatment."),
  dentistId: z.string().min(1, "Choose a dentist."),
  /** `yyyy-MM-dd`. */
  date: z.string().min(1, "Pick a date."),
  /** Minutes from midnight, as a string because it comes from a select. */
  time: z.string().min(1, "Pick a time."),
  status: appointmentStatusSchema,
  channel: bookingChannelSchema,
  notes: z.string().max(1000, "Keep notes under 1,000 characters."),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

export const appointmentTableFilterSchema = z.object({
  search: z.string().default(""),
  statuses: z.array(appointmentStatusSchema).default([]),
  dentistId: z.string().default("all"),
  from: z.string().nullable().default(null),
  to: z.string().nullable().default(null),
});

export type AppointmentTableFilter = z.infer<typeof appointmentTableFilterSchema>;

export const emptyAppointmentFilter: AppointmentTableFilter = {
  search: "",
  statuses: [],
  dentistId: "all",
  from: null,
  to: null,
};
