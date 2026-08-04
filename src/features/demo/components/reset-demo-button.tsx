"use client";

import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useResetDemo } from "@/features/demo";

export function ResetDemoButton() {
  const { mutate, isPending } = useResetDemo();

  return (
    <ConfirmDialog
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start text-brand-200 hover:bg-sidebar-accent hover:text-ink-0"
          disabled={isPending}
        >
          <RotateCcw aria-hidden />
          {isPending ? "Resetting…" : "Reset demo data"}
        </Button>
      }
      title="Reset the demo data?"
      description="Every appointment, patient and note added during this session is replaced with the original seed data. This cannot be undone."
      confirmLabel="Reset demo data"
      cancelLabel="Leave it as it is"
      onConfirm={() =>
        mutate(undefined, {
          onSuccess: (counts) => {
            toast.success("Demo data reset", {
              description: `Back to ${counts.appointments} appointments and ${counts.patients} patients.`,
            });
          },
          onError: () => {
            toast.error("Reset failed", {
              description: "The store did not re-seed. Refresh the page instead.",
            });
          },
        })
      }
    />
  );
}
