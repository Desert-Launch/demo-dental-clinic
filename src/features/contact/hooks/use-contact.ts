"use client";

import { useMutation } from "@tanstack/react-query";

import { submitEnquiry } from "@/features/contact/api";
import type { ContactFormValues } from "@/features/contact/schema";

export function useSubmitEnquiry() {
  return useMutation({
    mutationFn: (values: ContactFormValues) => submitEnquiry(values),
  });
}
