import { QueryClient } from "@tanstack/react-query";

/**
 * The data layer is an in-memory store, so retries and window-focus refetches
 * add noise without adding safety. Keep it quiet and deterministic for demos.
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/** Query key factory — every feature reads its keys from here. */
export const queryKeys = {
  services: {
    all: ["services"] as const,
    list: () => [...queryKeys.services.all, "list"] as const,
    detail: (id: string) => [...queryKeys.services.all, "detail", id] as const,
  },
  dentists: {
    all: ["dentists"] as const,
    list: () => [...queryKeys.dentists.all, "list"] as const,
    detail: (id: string) => [...queryKeys.dentists.all, "detail", id] as const,
  },
  patients: {
    all: ["patients"] as const,
    list: (filters?: unknown) => [...queryKeys.patients.all, "list", filters ?? null] as const,
    detail: (id: string) => [...queryKeys.patients.all, "detail", id] as const,
  },
  appointments: {
    all: ["appointments"] as const,
    list: (filters?: unknown) =>
      [...queryKeys.appointments.all, "list", filters ?? null] as const,
    detail: (id: string) => [...queryKeys.appointments.all, "detail", id] as const,
    availability: (input: unknown) =>
      [...queryKeys.appointments.all, "availability", input] as const,
    stats: () => [...queryKeys.appointments.all, "stats"] as const,
  },
} as const;
