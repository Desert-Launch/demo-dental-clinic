"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createPatientRecord,
  deletePatientRecord,
  fetchPatient,
  fetchPatients,
  updatePatientRecord,
} from "@/features/patients/api";
import { queryKeys } from "@/lib/query-client";
import type { CreatePatientInput, PatientFilters, UpdatePatientPatch } from "@/lib/store";

export function usePatients(filters: PatientFilters = {}) {
  return useQuery({
    queryKey: queryKeys.patients.list(filters),
    queryFn: () => fetchPatients(filters),
  });
}

export function usePatient(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.patients.detail(id ?? "none"),
    queryFn: () => fetchPatient(id as string),
    enabled: Boolean(id),
  });
}

/** Patient names are denormalised into appointment views, so both refresh. */
function useInvalidatePatients() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
  };
}

export function useCreatePatient() {
  const invalidate = useInvalidatePatients();
  return useMutation({
    mutationFn: (input: CreatePatientInput) => createPatientRecord(input),
    onSuccess: invalidate,
  });
}

export function useUpdatePatient() {
  const invalidate = useInvalidatePatients();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdatePatientPatch }) =>
      updatePatientRecord(id, patch),
    onSuccess: invalidate,
  });
}

export function useDeletePatient() {
  const invalidate = useInvalidatePatients();
  return useMutation({
    mutationFn: (id: string) => deletePatientRecord(id),
    onSuccess: invalidate,
  });
}
