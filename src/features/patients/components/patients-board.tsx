"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { MoreHorizontal, Pencil, Search, Trash2, UserPlus, UserSearch } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PatientDetailDrawer } from "@/features/patients/components/patient-detail-drawer";
import { PatientFormDialog } from "@/features/patients/components/patient-form-dialog";
import { insurers, useDeletePatient, usePatients } from "@/features/patients";
import { formatAED, initials, pluralise } from "@/lib/utils";
import { patientFullName, type PatientWithHistory } from "@/types";

const column = createColumnHelper<PatientWithHistory>();

const ALL_INSURERS = "all";

export function PatientsBoard() {
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [insurer, setInsurer] = useState<string>(ALL_INSURERS);
  const [sorting, setSorting] = useState<SortingState>([{ id: "patient", desc: false }]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PatientWithHistory | null>(null);
  const [deleting, setDeleting] = useState<PatientWithHistory | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchDraft), 220);
    return () => window.clearTimeout(timer);
  }, [searchDraft]);

  const { data: patients, isLoading } = usePatients({
    search: search || undefined,
    insurer: insurer === ALL_INSURERS ? undefined : insurer,
  });

  const remove = useDeletePatient();
  const isFiltered = search !== "" || insurer !== ALL_INSURERS;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(patientId: string) {
    const patient = patients?.find((item) => item.id === patientId) ?? null;
    setEditing(patient);
    setFormOpen(true);
  }

  const columns = useMemo(
    () => [
      column.accessor((row) => patientFullName(row), {
        id: "patient",
        header: "Patient",
        cell: ({ row }) => (
          <div className="flex min-w-52 items-center gap-3">
            <span
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mint-100 text-small font-semibold text-brand-800"
            >
              {initials(patientFullName(row.original))}
            </span>
            <div className="min-w-0">
              <p className="truncate text-body font-medium text-ink-900">
                {patientFullName(row.original)}
              </p>
              <p className="truncate text-small text-ink-500">{row.original.email}</p>
            </div>
          </div>
        ),
      }),
      column.accessor((row) => row.phone, {
        id: "phone",
        header: "Mobile",
        enableSorting: false,
        cell: ({ row }) => (
          <p data-numeric className="min-w-36 text-body text-ink-700">
            {row.original.phone}
          </p>
        ),
      }),
      column.accessor((row) => row.insurer ?? "Self-pay", {
        id: "insurer",
        header: "Insurance",
        cell: ({ row }) => (
          <p className="text-body text-ink-700">{row.original.insurer ?? "Self-pay"}</p>
        ),
      }),
      column.accessor((row) => (row.lastVisitAt ? new Date(row.lastVisitAt).getTime() : 0), {
        id: "lastVisit",
        header: "Last visit",
        cell: ({ row }) => (
          <p className="text-body text-ink-700">
            {row.original.lastVisitAt
              ? format(parseISO(row.original.lastVisitAt), "d MMM yyyy")
              : "—"}
          </p>
        ),
      }),
      column.accessor((row) => (row.nextVisitAt ? new Date(row.nextVisitAt).getTime() : 0), {
        id: "nextVisit",
        header: "Next visit",
        cell: ({ row }) => (
          <p className="text-body">
            {row.original.nextVisitAt ? (
              <span className="text-brand-700">
                {format(parseISO(row.original.nextVisitAt), "d MMM yyyy")}
              </span>
            ) : (
              <span className="text-ink-500">Nothing booked</span>
            )}
          </p>
        ),
      }),
      column.accessor((row) => row.totalSpendAED, {
        id: "spend",
        header: "Spend",
        cell: ({ row }) => (
          <p data-numeric className="text-body text-ink-700">
            {formatAED(row.original.totalSpendAED)}
          </p>
        ),
      }),
      column.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${patientFullName(row.original)}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreHorizontal aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(event) => event.stopPropagation()}
              >
                <DropdownMenuItem onSelect={() => setOpenId(row.original.id)}>
                  <UserSearch aria-hidden />
                  Open record
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => openEdit(row.original.id)}>
                  <Pencil aria-hidden />
                  Edit details
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setDeleting(row.original)}
                >
                  <Trash2 aria-hidden />
                  Delete patient
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      }),
    ],
    // Handlers close over setState only, which React keeps stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [patients],
  );

  const table = useReactTable({
    data: patients ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
    // Nothing here is paginated; leaving the auto-reset on makes the table
    // loop state updates every time a filtered query returns new data.
    autoResetPageIndex: false,
  });

  const count = patients?.length ?? 0;

  return (
    <div className="mx-auto max-w-[86rem]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Patients</p>
          <h1 className="mt-2 text-display-3 text-ink-950">The list</h1>
          <p className="mt-2 text-body text-ink-600">
            Everyone on the books. Open a record for history, notes and contact details.
          </p>
        </div>
        <Button size="lg" onClick={openCreate}>
          <UserPlus aria-hidden />
          Add patient
        </Button>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400"
            aria-hidden
          />
          <Input
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Search name, email or mobile"
            className="pl-9"
            aria-label="Search patients"
          />
        </div>
        <Select value={insurer} onValueChange={setInsurer}>
          <SelectTrigger className="w-52" aria-label="Filter by insurance">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_INSURERS}>All insurance</SelectItem>
            {insurers.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="mt-3 text-small text-ink-600" data-numeric>
        {count} {pluralise(count, "patient", "patients")}
        {isFiltered ? " match this search" : " on the list"}
      </p>

      <div className="mt-4">
        <DataTable
          table={table}
          isLoading={isLoading}
          onRowClick={(patient) => setOpenId(patient.id)}
          emptyState={
            <EmptyState
              icon={UserSearch}
              title={isFiltered ? "Nobody matches that search" : "No patients yet"}
              description={
                isFiltered
                  ? "Try part of a surname, an email address, or clear the insurance filter."
                  : "Add the first patient, or let the website create records as people book."
              }
              action={
                isFiltered ? (
                  <Button
                    onClick={() => {
                      setSearchDraft("");
                      setSearch("");
                      setInsurer(ALL_INSURERS);
                    }}
                  >
                    Clear the search
                  </Button>
                ) : (
                  <Button onClick={openCreate}>
                    <UserPlus aria-hidden />
                    Add patient
                  </Button>
                )
              }
              className="rounded-none border-0 bg-transparent"
            />
          }
        />
      </div>

      <PatientDetailDrawer
        patientId={openId}
        onClose={() => setOpenId(null)}
        onEdit={(patientId) => {
          setOpenId(null);
          openEdit(patientId);
        }}
        onDelete={(patientId) => {
          const patient = patients?.find((item) => item.id === patientId) ?? null;
          setOpenId(null);
          setDeleting(patient);
        }}
      />

      <PatientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        patient={editing}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete this patient?"
        description={
          deleting
            ? `${patientFullName(deleting)} and their ${deleting.appointments.length} ${pluralise(deleting.appointments.length, "appointment", "appointments")} are removed from the diary as well. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete patient"
        cancelLabel="Keep the record"
        onConfirm={() => {
          const target = deleting;
          if (!target) return;
          remove.mutate(target.id, {
            onSuccess: () =>
              toast.success("Patient deleted", {
                description: `${patientFullName(target)} is off the list.`,
              }),
            onError: (error) =>
              toast.error("Not deleted", {
                description:
                  error instanceof Error
                    ? error.message
                    : "The record is still there. Try again.",
              }),
          });
          setDeleting(null);
        }}
      />
    </div>
  );
}
