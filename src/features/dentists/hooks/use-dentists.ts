"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchDentist,
  fetchDentists,
  fetchDentistsForService,
} from "@/features/dentists/api";
import { queryKeys } from "@/lib/query-client";

export function useDentists() {
  return useQuery({
    queryKey: queryKeys.dentists.list(),
    queryFn: fetchDentists,
  });
}

export function useDentist(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.dentists.detail(id ?? "none"),
    queryFn: () => fetchDentist(id as string),
    enabled: Boolean(id),
  });
}

export function useDentistsForService(serviceId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.dentists.all, "for-service", serviceId ?? "none"],
    queryFn: () => fetchDentistsForService(serviceId as string),
    enabled: Boolean(serviceId),
  });
}
