import { z } from "zod";

export const contactTopics = [
  "New patient enquiry",
  "Existing appointment",
  "Treatment question",
  "Insurance and billing",
  "Something else",
] as const;

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name."),
  email: z.email("Enter an email address like name@example.com."),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?971|0)[\s-]?\d{1,2}[\s-]?\d{3}[\s-]?\d{4}$/, "Enter a UAE number, like +971 50 123 4567."),
  topic: z.enum(contactTopics),
  message: z
    .string()
    .trim()
    .min(12, "A sentence or two is enough — tell us how we can help.")
    .max(1200, "Keep the message under 1,200 characters."),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
