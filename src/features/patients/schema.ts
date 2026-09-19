import { differenceInYears, isValid, parseISO } from "date-fns";
import { z } from "zod";

/** UAE mobile or landline, with or without spaces: +971 50 123 4567, 0501234567.
 *  The last four may be `x` placeholders — every seeded number ends in "xxx" so
 *  the demo can never dial a real line, and editing such a record must still
 *  validate. */
const phonePattern = /^(\+?971|0)[\s-]?\d{1,2}[\s-]?\d{3}[\s-]?[\dx]{4}$/i;

/** Generic on purpose: a demo should not put real insurers' names on invented
 *  patients. */
export const insurers = ["Insurer A", "Insurer B", "Insurer C", "Insurer D", "Insurer E"] as const;

/** The value the select uses for "no insurer" — a select cannot hold null. */
export const SELF_PAY = "self-pay";

export const patientFormSchema = z.object({
  firstName: z.string().trim().min(2, "Enter a first name."),
  lastName: z.string().trim().min(2, "Enter a last name."),
  email: z.email("Enter an email address like name@example.com."),
  phone: z
    .string()
    .trim()
    .regex(phonePattern, "Enter a UAE number, like +971 50 123 4567."),
  dateOfBirth: z
    .string()
    .min(1, "Enter a date of birth.")
    .refine((value) => isValid(parseISO(value)), "Enter a date like 1990-04-21.")
    .refine((value) => {
      const age = differenceInYears(new Date(), parseISO(value));
      return age >= 0 && age <= 120;
    }, "That date of birth is outside the range we can accept."),
  insurer: z.string(),
  notes: z.string().max(2000, "Keep notes under 2,000 characters."),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

export const patientNotesSchema = z.object({
  notes: z.string().max(2000, "Keep notes under 2,000 characters."),
});

export type PatientNotesValues = z.infer<typeof patientNotesSchema>;

/** Select value → stored value. */
export function toStoredInsurer(value: string): string | null {
  return value === SELF_PAY ? null : value;
}

/** Stored value → select value. */
export function toInsurerSelectValue(value: string | null): string {
  return value ?? SELF_PAY;
}
