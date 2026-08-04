"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { format, isToday, isTomorrow } from "date-fns";
import {
  CalendarPlus,
  CalendarX2,
  CheckCheck,
  MoreHorizontal,
  Pencil,
  Rows3,
  Trash2,
  UserX,
} from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppointmentFilters } from "@/features/appointments/components/appointment-filters";
import { AppointmentFormDialog } from "@/features/appointments/components/appointment-form-dialog";
import { StatusBadge } from "@/features/appointments/components/status-badge";
import {
  emptyAppointmentFilter,
  useAppointments,
  useCancelAppointment,
  useDeleteAppointment,
  useSetAppointmentStatus,
  type AppointmentTableFilter,
} from "@/features/appointments";
import { useSessionStore } from "@/lib/state/session-store";
import { cn, formatAED, formatDuration, formatTime, initials } from "@/lib/utils";
import { patientFullName, type AppointmentWithRelations } from "@/types";

const column = createColumnHelper<AppointmentWithRelations>();

export function AppointmentsBoard() {
  const [filter, setFilter] = useState<AppointmentTableFilter>(emptyAppointmentFilter);
  const [sorting, setSorting] = useState<SortingState>([{ id: "when", desc: false }]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AppointmentWithRelations | null>(null);
  const [deleting, setDeleting] = useState<AppointmentWithRelations | null>(null);

  const compact = useSessionStore((state) => state.compactTable);
  const toggleCompact = useSessionStore((state) => state.toggleCompactTable);

  const { data: appointments, isLoading } = useAppointments({
    search: filter.search || undefined,
    statuses: filter.statuses.length > 0 ? filter.statuses : undefined,
    dentistId: filter.dentistId === "all" ? undefined : filter.dentistId,
    from: filter.from ?? undefined,
    to: filter.to ?? undefined,
  });

  const setStatus = useSetAppointmentStatus();
  const cancel = useCancelAppointment();
  const remove = useDeleteAppointment();

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(appointment: AppointmentWithRelations) {
    setEditing(appointment);
    setFormOpen(true);
  }

  function markStatus(
    appointment: AppointmentWithRelations,
    status: AppointmentWithRelations["status"],
    label: string,
  ) {
    setStatus.mutate(
      { id: appointment.id, status },
      {
        onSuccess: () =>
          toast.success(label, {
            description: `${patientFullName(appointment.patient)} — ${format(new Date(appointment.startsAt), "EEE d MMM")}.`,
          }),
        onError: (error) =>
          toast.error("Status not changed", {
            description:
              error instanceof Error ? error.message : "Nothing was saved. Try again.",
          }),
      },
    );
  }

  function cancelAppointment(appointment: AppointmentWithRelations) {
    cancel.mutate(appointment.id, {
      onSuccess: () =>
        toast.success("Appointment cancelled", {
          description: `${patientFullName(appointment.patient)}'s slot is free again.`,
        }),
      // The store rejects roughly one cancellation in ten on purpose; the
      // optimistic row flips back and the patient sees why.
      onError: (error) =>
        toast.error("Cancellation not saved", {
          description:
            error instanceof Error
              ? error.message
              : "The appointment is unchanged. Try again.",
        }),
    });
  }

  const columns = useMemo(
    () => [
      column.accessor((row) => new Date(row.startsAt).getTime(), {
        id: "when",
        header: "When",
        cell: ({ row }) => {
          const start = new Date(row.original.startsAt);
          return (
            <div className="min-w-32">
              <p className="text-body font-medium text-ink-900">
                {isToday(start)
                  ? "Today"
                  : isTomorrow(start)
                    ? "Tomorrow"
                    : format(start, "EEE d MMM")}
              </p>
              <p data-numeric className="text-small text-ink-600">
                {formatTime(start)} · {formatDuration(row.original.durationMinutes)}
              </p>
            </div>
          );
        },
      }),
      column.accessor((row) => patientFullName(row.patient), {
        id: "patient",
        header: "Patient",
        cell: ({ row }) => (
          <div className="flex min-w-48 items-center gap-3">
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-mint-100 text-small font-semibold text-brand-800"
            >
              {initials(patientFullName(row.original.patient))}
            </span>
            <div className="min-w-0">
              <p className="truncate text-body font-medium text-ink-900">
                {patientFullName(row.original.patient)}
              </p>
              <p data-numeric className="truncate text-small text-ink-500">
                {row.original.reference}
              </p>
            </div>
          </div>
        ),
      }),
      column.accessor((row) => row.service.name, {
        id: "treatment",
        header: "Treatment",
        cell: ({ row }) => (
          <p className="min-w-40 text-body text-ink-800">{row.original.service.name}</p>
        ),
      }),
      column.accessor((row) => row.dentist.name, {
        id: "dentist",
        header: "Dentist",
        cell: ({ row }) => (
          <p className="min-w-36 text-body text-ink-700">{row.original.dentist.name}</p>
        ),
      }),
      column.accessor((row) => row.status, {
        id: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      }),
      column.accessor((row) => row.priceAED, {
        id: "price",
        header: "Price",
        cell: ({ row }) => (
          <p
            data-numeric
            className={cn(
              "text-body",
              row.original.status === "completed"
                ? "font-medium text-ink-900"
                : "text-ink-600",
            )}
          >
            {formatAED(row.original.priceAED)}
          </p>
        ),
      }),
      column.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const appointment = row.original;
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions for ${patientFullName(appointment.patient)}`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <MoreHorizontal aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56"
                  onClick={(event) => event.stopPropagation()}
                >
                  <DropdownMenuLabel>{appointment.reference}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => openEdit(appointment)}>
                    <Pencil aria-hidden />
                    Edit or reschedule
                  </DropdownMenuItem>
                  {appointment.status !== "confirmed" &&
                  appointment.status !== "completed" ? (
                    <DropdownMenuItem
                      onSelect={() =>
                        markStatus(appointment, "confirmed", "Appointment confirmed")
                      }
                    >
                      <CheckCheck aria-hidden />
                      Mark as confirmed
                    </DropdownMenuItem>
                  ) : null}
                  {appointment.status !== "completed" ? (
                    <DropdownMenuItem
                      onSelect={() =>
                        markStatus(appointment, "completed", "Appointment completed")
                      }
                    >
                      <CheckCheck aria-hidden />
                      Mark as completed
                    </DropdownMenuItem>
                  ) : null}
                  {appointment.status !== "no-show" ? (
                    <DropdownMenuItem
                      onSelect={() =>
                        markStatus(appointment, "no-show", "Marked as a no-show")
                      }
                    >
                      <UserX aria-hidden />
                      Mark as no-show
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  {appointment.status !== "cancelled" ? (
                    <DropdownMenuItem onSelect={() => cancelAppointment(appointment)}>
                      <CalendarX2 aria-hidden />
                      Cancel appointment
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => setDeleting(appointment)}
                  >
                    <Trash2 aria-hidden />
                    Delete permanently
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    // The mutation helpers are stable for the life of the component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const table = useReactTable({
    data: appointments ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  });

  const isFiltered =
    filter.search !== "" ||
    filter.statuses.length > 0 ||
    filter.dentistId !== "all" ||
    filter.from !== null;

  return (
    <div className="mx-auto max-w-[86rem]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Appointments</p>
          <h1 className="mt-2 text-display-3 text-ink-950">The diary</h1>
          <p className="mt-2 text-body text-ink-600">
            Everything on the books, past and future. Changes here show up on the public
            site straight away.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={toggleCompact}>
            <Rows3 aria-hidden />
            {compact ? "Comfortable rows" : "Compact rows"}
          </Button>
          <Button size="lg" onClick={openCreate}>
            <CalendarPlus aria-hidden />
            New appointment
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <AppointmentFilters
          filter={filter}
          onChange={setFilter}
          resultCount={appointments?.length ?? 0}
        />
      </div>

      <div className="mt-4">
        <DataTable
          table={table}
          isLoading={isLoading}
          compact={compact}
          onRowClick={openEdit}
          emptyState={
            <EmptyState
              icon={CalendarX2}
              title={isFiltered ? "Nothing matches those filters" : "The diary is empty"}
              description={
                isFiltered
                  ? "Widen the date range or clear a filter to see more of the diary."
                  : "Add the first appointment, or wait for one to come in from the website."
              }
              action={
                isFiltered ? (
                  <Button onClick={() => setFilter(emptyAppointmentFilter)}>
                    Clear filters
                  </Button>
                ) : (
                  <Button onClick={openCreate}>
                    <CalendarPlus aria-hidden />
                    New appointment
                  </Button>
                )
              }
              className="rounded-none border-0 bg-transparent"
            />
          }
        />
      </div>

      <AppointmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        appointment={editing}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete this appointment?"
        description={
          deleting
            ? `${patientFullName(deleting.patient)}'s ${deleting.service.name.toLowerCase()} on ${format(new Date(deleting.startsAt), "EEEE d MMMM")} is removed from the diary and from their history. Cancelling instead keeps the record.`
            : ""
        }
        confirmLabel="Delete permanently"
        cancelLabel="Keep the appointment"
        onConfirm={() => {
          const target = deleting;
          if (!target) return;
          remove.mutate(target.id, {
            onSuccess: () =>
              toast.success("Appointment deleted", {
                description: `${target.reference} is gone from the diary.`,
              }),
            onError: (error) =>
              toast.error("Not deleted", {
                description:
                  error instanceof Error
                    ? error.message
                    : "The appointment is still there. Try again.",
              }),
          });
          setDeleting(null);
        }}
      />
    </div>
  );
}
