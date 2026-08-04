"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { resetDemoData } from "@/features/demo/api";

export function useResetDemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resetDemoData,
    onSuccess: () => {
      // Every cached list now points at records that no longer exist.
      queryClient.clear();
    },
  });
}
