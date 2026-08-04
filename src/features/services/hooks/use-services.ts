"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchService, fetchServices } from "@/features/services/api";
import { queryKeys } from "@/lib/query-client";

export function useServices() {
  return useQuery({
    queryKey: queryKeys.services.list(),
    queryFn: fetchServices,
  });
}

export function useService(idOrSlug: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.services.detail(idOrSlug ?? "none"),
    queryFn: () => fetchService(idOrSlug as string),
    enabled: Boolean(idOrSlug),
  });
}
