"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  appointmentFormSchema,
  useCreateAppointment,
  useUpdateAppointment,
  type AppointmentFormValues,
} from "@/features/appointments";
import { useDentists } from "@/features/dentists";
import { usePatients } from "@/features/patients";
import { useServices } from "@/features/services";
import { candidateSlotStarts, minutesOfDay } from "@/lib/scheduling";
import { formatMinutesOfDay, formatAED } from "@/lib/utils";
import {
  appointmentStatusLabels,
  appointmentStatuses,
  bookingChannels,
  patientFullName,
  type AppointmentWithRelations,
} from "@/types";

const channelLabels: Record<(typeof bookingChannels)[number], string> = {
  online: "Booked online",
  phone: "Called the clinic",
  "walk-in": "Walked in",
};

function toFormValues(appointment: AppointmentWithRelations): AppointmentFormValues {
  const startsAt = new Date(appointment.startsAt);
  return {
    patientId: appointment.patientId,
    serviceId: appointment.serviceId,
    dentistId: appointment.dentistId,
    date: format(startsAt, "yyyy-MM-dd"),
    time: String(minutesOfDay(startsAt)),
    status: appointment.status,
    channel: appointment.channel,
    notes: appointment.notes,
  };
}

function blankValues(): AppointmentFormValues {
  return {
    patientId: "",
    serviceId: "",
    dentistId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "",
    status: "scheduled",
    channel: "phone",
    notes: "",
  };
}

export function AppointmentFormDialog({
  open,
  onOpenChange,
  appointment,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when editing, absent when creating. */
  appointment?: AppointmentWithRelations | null;
}) {
  const { data: patients } = usePatients();
  const { data: services } = useServices();
  const { data: dentists } = useDentists();
  const create = useCreateAppointment();
  const update = useUpdateAppointment();

  const isEditing = Boolean(appointment);
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: appointment ? toFormValues(appointment) : blankValues(),
    mode: "onBlur",
  });

  // The dialog stays mounted between rows, so reset when the subject changes.
  useEffect(() => {
    if (!open) return;
    form.reset(appointment ? toFormValues(appointment) : blankValues());
  }, [appointment, form, open]);

  const serviceId = form.watch("serviceId");
  const dentistId = form.watch("dentistId");
  const date = form.watch("date");

  const service = services?.find((item) => item.id === serviceId);
  const eligibleDentists = useMemo(() => {
    if (!dentists) return [];
    if (!service) return dentists;
    return dentists.filter((dentist) => dentist.specialties.includes(service.category));
  }, [dentists, service]);

  // Drop a dentist who cannot perform the newly chosen treatment.
  useEffect(() => {
    if (!dentistId || !service) return;
    if (!eligibleDentists.some((dentist) => dentist.id === dentistId)) {
      form.setValue("dentistId", "");
    }
  }, [dentistId, eligibleDentists, form, service]);

  const timeOptions = useMemo(() => {
    if (!service || !date) return [];
    return candidateSlotStarts(parseISO(date), service.durationMinutes);
  }, [date, service]);

  const isPending = create.isPending || update.isPending;

  function onSubmit(values: AppointmentFormValues) {
    const startsAt = parseISO(values.date);
    startsAt.setHours(0, Number(values.time), 0, 0);

    const onError = (error: unknown) => {
      toast.error(isEditing ? "Changes not saved" : "Appointment not created", {
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Check the details and try again.",
      });
    };

    if (appointment) {
      update.mutate(
        {
          id: appointment.id,
          patch: {
            serviceId: values.serviceId,
            dentistId: values.dentistId,
            startsAt: startsAt.toISOString(),
            status: values.status,
            channel: values.channel,
            notes: values.notes,
          },
        },
        {
          onSuccess: (saved) => {
            toast.success("Appointment updated", {
              description: `${patientFullName(saved.patient)} — ${format(new Date(saved.startsAt), "EEE d MMM")} at ${formatMinutesOfDay(minutesOfDay(new Date(saved.startsAt)))}.`,
            });
            onOpenChange(false);
          },
          onError,
        },
      );
      return;
    }

    create.mutate(
      {
        patientId: values.patientId,
        serviceId: values.serviceId,
        dentistId: values.dentistId,
        startsAt: startsAt.toISOString(),
        status: values.status,
        channel: values.channel,
        notes: values.notes,
      },
      {
        onSuccess: (saved) => {
          toast.success("Appointment created", {
            description: `${saved.reference} — ${patientFullName(saved.patient)} with ${saved.dentist.name}.`,
          });
          onOpenChange(false);
        },
        onError,
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit appointment" : "New appointment"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Reference ${appointment?.reference}. Changes apply straight away.`
              : "For calls and walk-ins. Patients booking themselves come through the website."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="appointment-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-5 sm:grid-cols-2"
            noValidate
          >
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Patient</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isEditing}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a patient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-72">
                      {patients?.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patientFullName(patient)} · {patient.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isEditing ? (
                    <FormDescription>
                      To move this to another patient, cancel it and book again.
                    </FormDescription>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Treatment</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a treatment" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-72">
                      {services?.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} · {formatAED(item.priceAED)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dentistId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dentist</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!serviceId}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={serviceId ? "Choose a dentist" : "Pick a treatment first"}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eligibleDentists.map((dentist) => (
                        <SelectItem key={dentist.id} value={dentist.id}>
                          {dentist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start time</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={timeOptions.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            !service
                              ? "Pick a treatment first"
                              : timeOptions.length === 0
                                ? "Closed that day"
                                : "Choose a time"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-72">
                      {timeOptions.map((minutes) => (
                        <SelectItem key={minutes} value={String(minutes)}>
                          {formatMinutesOfDay(minutes)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {service
                      ? `${service.durationMinutes} minutes in the chair.`
                      : "Times follow the treatment length."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {appointmentStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {appointmentStatusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Booked through</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bookingChannels.map((channel) => (
                        <SelectItem key={channel} value={channel}>
                          {channelLabels[channel]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Notes for the day</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Bringing a referral letter, needs a longer chair turnaround, prefers Arabic…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="appointment-form" disabled={isPending}>
            {isPending
              ? "Saving…"
              : isEditing
                ? "Save changes"
                : "Create appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
