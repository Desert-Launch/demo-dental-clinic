import { format } from "date-fns";

import type { ContactFormValues } from "@/features/contact/schema";
import { sleep } from "@/lib/store";

export interface ContactReceipt {
  reference: string;
  receivedAt: string;
  repliesWithin: string;
}

/**
 * Nothing is sent anywhere — the demo has no backend. The receipt is generated
 * so the success state has something concrete to show the patient.
 */
export async function submitEnquiry(values: ContactFormValues): Promise<ContactReceipt> {
  await sleep(420);
  const stamp = format(new Date(), "yyMMdd");
  const suffix = Math.floor(1000 + Math.random() * 8999);
  return {
    reference: `ENQ-${stamp}-${suffix}`,
    receivedAt: new Date().toISOString(),
    repliesWithin:
      values.topic === "Existing appointment" ? "the same working day" : "one working day",
  };
}
