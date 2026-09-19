"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInYears, format, parseISO } from "date-fns";
import { useForm } from "react-hook-form";
import { CalendarPlus, Mail, Pencil, Phone, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/features/appointments/components/status-badge";
import {
  patientNotesSchema,
  usePatient,
  useUpdatePatient,
  type PatientNotesValues,
} from "@/features/patients";
import { formatAED, formatTime, initials } from "@/lib/utils";
import { patientFullName } from "@/types";

export function PatientDetailDrawer({
  patientId,
  onClose,
  onEdit,
  onDelete,
}: {
  patientId: string | null;
  onClose: () => void;
  onEdit: (patientId: string) => void;
  onDelete: (patientId: string) => void;
}) {
  const { data: patient, isLoading } = usePatient(patientId);

  return (
    <Sheet open={patientId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto sm:max-w-lg"
      >
        {isLoading || !patient ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <>
            <SheetHeader className="gap-4">
              <div className="flex items-center gap-4">
                <span
                  aria-hidden
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-mint-200 text-subtitle font-semibold text-brand-900"
                >
                  {initials(patientFullName(patient))}
                </span>
                <div className="min-w-0">
                  <SheetTitle className="truncate text-title">
                    {patientFullName(patient)}
                  </SheetTitle>
                  <SheetDescription>
                    {differenceInYears(new Date(), parseISO(patient.dateOfBirth))} years
                    old · patient since {format(parseISO(patient.createdAt), "MMMM yyyy")}
                  </SheetDescription>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(patient.id)}>
                  <Pencil aria-hidden />
                  Edit details
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:bg-danger-50 hover:text-destructive"
                  onClick={() => onDelete(patient.id)}
                >
                  <Trash2 aria-hidden />
                  Delete patient
                </Button>
              </div>
            </SheetHeader>

            <div className="space-y-8 px-4 pb-8">
              <section>
                <h3 className="text-micro uppercase text-ink-500">Contact</h3>
                <ul className="mt-3 space-y-2.5">
                  {/* Plain text on purpose: seeded numbers end in "xxx" and must never dial. */}
                  <ContactRow icon={Phone} value={patient.phone} />
                  <ContactRow icon={Mail} value={patient.email} href={`mailto:${patient.email}`} />
                  <ContactRow
                    icon={ShieldCheck}
                    value={patient.insurer ?? "Self-pay"}
                  />
                </ul>
              </section>

              <section className="grid grid-cols-3 gap-3">
                <SummaryTile
                  label="Visits"
                  value={String(
                    patient.appointments.filter((item) => item.status === "completed")
                      .length,
                  )}
                />
                <SummaryTile
                  label="Last visit"
                  value={
                    patient.lastVisitAt
                      ? format(parseISO(patient.lastVisitAt), "d MMM yy")
                      : "—"
                  }
                />
                <SummaryTile label="Spend" value={formatAED(patient.totalSpendAED)} />
              </section>

              <Separator />

              <NotesEditor
                patientId={patient.id}
                notes={patient.notes}
                name={patientFullName(patient)}
              />

              <Separator />

              <section>
                <h3 className="text-micro uppercase text-ink-500">
                  Appointment history
                </h3>
                {patient.appointments.length === 0 ? (
                  <EmptyState
                    icon={CalendarPlus}
                    title="No appointments yet"
                    description="Nothing booked and nothing in the past. Add the first visit from the diary."
                    className="mt-3 py-10"
                  />
                ) : (
                  <ol className="mt-3 space-y-2">
                    {patient.appointments.map((appointment) => {
                      const start = new Date(appointment.startsAt);
                      return (
                        <li
                          key={appointment.id}
                          className="rounded-lg border border-border bg-surface p-3.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-body font-medium text-ink-900">
                                {appointment.service.name}
                              </p>
                              <p data-numeric className="mt-0.5 text-small text-ink-600">
                                {format(start, "EEE d MMM yyyy")} · {formatTime(start)} ·{" "}
                                {appointment.dentist.name}
                              </p>
                            </div>
                            <StatusBadge status={appointment.status} />
                          </div>
                          {appointment.notes ? (
                            <p className="mt-2 border-t border-border pt-2 text-small text-ink-600">
                              {appointment.notes}
                            </p>
                          ) : null}
                        </li>
                      );
                    })}
                  </ol>
                )}
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ContactRow({
  icon: Icon,
  value,
  href,
}: {
  icon: typeof Phone;
  value: string;
  href?: string;
}) {
  return (
    <li className="flex items-center gap-3 text-body text-ink-800">
      <Icon className="size-4 shrink-0 text-brand-600" aria-hidden />
      {href ? (
        <a href={href} className="underline-offset-4 hover:text-brand-700 hover:underline">
          {value}
        </a>
      ) : (
        value
      )}
    </li>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted/60 p-3">
      <p className="text-small text-ink-500">{label}</p>
      <p data-numeric className="mt-1 text-body font-semibold text-ink-900">
        {value}
      </p>
    </div>
  );
}

/** Notes save on their own, so a long history doesn't get in the way. */
function NotesEditor({
  patientId,
  notes,
  name,
}: {
  patientId: string;
  notes: string;
  name: string;
}) {
  const update = useUpdatePatient();
  const form = useForm<PatientNotesValues>({
    resolver: zodResolver(patientNotesSchema),
    defaultValues: { notes },
  });

  useEffect(() => {
    form.reset({ notes });
  }, [form, notes, patientId]);

  const dirty = form.formState.isDirty;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          update.mutate(
            { id: patientId, patch: { notes: values.notes } },
            {
              onSuccess: () => {
                form.reset(values);
                toast.success("Notes saved", {
                  description: `${name}'s record is up to date.`,
                });
              },
              onError: (error) =>
                toast.error("Notes not saved", {
                  description:
                    error instanceof Error
                      ? error.message
                      : "Your text is still here. Try again.",
                }),
            },
          ),
        )}
      >
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-micro uppercase text-ink-500">
                Notes
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Allergies, anxieties, preferred times, who to bill."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-3 flex items-center gap-2">
          <Button type="submit" size="sm" disabled={!dirty || update.isPending}>
            {update.isPending ? "Saving…" : "Save notes"}
          </Button>
          {dirty ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => form.reset({ notes })}
            >
              Discard changes
            </Button>
          ) : null}
        </div>
      </form>
    </Form>
  );
}
