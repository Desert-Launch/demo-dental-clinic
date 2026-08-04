"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchAvailableDays,
  fetchDaySlots,
  fetchNextAvailable,
  submitBooking,
  type AvailabilityQuery,
  type SubmitBookingInput,
} from "@/features/booking/api";
import { queryKeys } from "@/lib/query-client";

export function useAvailableDays(query: Partial<AvailabilityQuery>) {
  const enabled = Boolean(query.serviceId && query.dentistId);
  return useQuery({
    queryKey: queryKeys.appointments.availability({ scope: "days", ...query }),
    queryFn: () => fetchAvailableDays(query as AvailabilityQuery),
    enabled,
  });
}

export function useDaySlots(query: Partial<AvailabilityQuery & { date: string }>) {
  const enabled = Boolean(query.serviceId && query.dentistId && query.date);
  return useQuery({
    queryKey: queryKeys.appointments.availability({ scope: "slots", ...query }),
    queryFn: () => fetchDaySlots(query as AvailabilityQuery & { date: string }),
    enabled,
  });
}

/** The soonest slot anyone can take, used by the hero and the booking intro. */
export function useNextAvailable(serviceId?: string) {
  return useQuery({
    queryKey: queryKeys.appointments.availability({ scope: "next", serviceId }),
    queryFn: () => fetchNextAvailable(serviceId),
  });
}

export function useSubmitBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitBookingInput) => submitBooking(input),
    onSuccess: () => {
      // A new booking changes availability, the admin lists and patient records.
      void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
    },
  });
}
