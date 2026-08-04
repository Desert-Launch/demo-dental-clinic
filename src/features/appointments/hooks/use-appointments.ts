"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";

import {
  cancelAppointment,
  createAppointmentRecord,
  deleteAppointmentRecord,
  fetchAppointment,
  fetchAppointments,
  fetchOverview,
  setAppointmentStatus,
  updateAppointmentRecord,
} from "@/features/appointments/api";
import { queryKeys } from "@/lib/query-client";
import type {
  AppointmentFilters,
  CreateAppointmentInput,
  UpdateAppointmentPatch,
} from "@/lib/store";
import type { AppointmentStatus, AppointmentWithRelations } from "@/types";

export function useAppointments(filters: AppointmentFilters = {}) {
  return useQuery({
    queryKey: queryKeys.appointments.list(filters),
    queryFn: () => fetchAppointments(filters),
  });
}

export function useAppointment(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.appointments.detail(id ?? "none"),
    queryFn: () => fetchAppointment(id as string),
    enabled: Boolean(id),
  });
}

export function useOverview() {
  return useQuery({
    queryKey: queryKeys.appointments.stats(),
    queryFn: fetchOverview,
  });
}

/** Appointment writes also change what the patient screens show. */
function useInvalidateAppointments() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
  };
}

export function useCreateAppointment() {
  const invalidate = useInvalidateAppointments();
  return useMutation({
    mutationFn: (input: CreateAppointmentInput) => createAppointmentRecord(input),
    onSuccess: invalidate,
  });
}

export function useUpdateAppointment() {
  const invalidate = useInvalidateAppointments();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateAppointmentPatch }) =>
      updateAppointmentRecord(id, patch),
    onSuccess: invalidate,
  });
}

export function useDeleteAppointment() {
  const invalidate = useInvalidateAppointments();
  return useMutation({
    mutationFn: (id: string) => deleteAppointmentRecord(id),
    onSuccess: invalidate,
  });
}

type ListSnapshot = [QueryKey, AppointmentWithRelations[] | undefined][];

/**
 * Applies a status to every cached appointment list straight away, keeping a
 * snapshot so a failed write can be rolled back.
 */
function useOptimisticStatus() {
  const queryClient = useQueryClient();

  return {
    async apply(id: string, status: AppointmentStatus): Promise<ListSnapshot> {
      await queryClient.cancelQueries({ queryKey: queryKeys.appointments.all });
      const snapshot = queryClient.getQueriesData<AppointmentWithRelations[]>({
        queryKey: queryKeys.appointments.all,
      });

      queryClient.setQueriesData<AppointmentWithRelations[]>(
        { queryKey: queryKeys.appointments.all },
        (current) => {
          // Overview and detail queries live under the same key prefix.
          if (!Array.isArray(current)) return current;
          return current.map((item) => (item.id === id ? { ...item, status } : item));
        },
      );

      return snapshot;
    },
    rollback(snapshot: ListSnapshot | undefined) {
      snapshot?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    settle() {
      void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
    },
  };
}

export function useSetAppointmentStatus() {
  const optimistic = useOptimisticStatus();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      setAppointmentStatus(id, status),
    onMutate: ({ id, status }) => optimistic.apply(id, status),
    onError: (_error, _variables, context) => optimistic.rollback(context),
    onSettled: () => optimistic.settle(),
  });
}

/**
 * Cancelling is optimistic too, and the underlying call fails on purpose about
 * one time in ten so the rollback is demoable.
 */
export function useCancelAppointment() {
  const optimistic = useOptimisticStatus();
  return useMutation({
    mutationFn: (id: string) => cancelAppointment(id),
    onMutate: (id) => optimistic.apply(id, "cancelled"),
    onError: (_error, _id, context) => optimistic.rollback(context),
    onSettled: () => optimistic.settle(),
  });
}
