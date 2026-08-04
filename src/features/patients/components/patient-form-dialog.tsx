"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
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
  SELF_PAY,
  insurers,
  patientFormSchema,
  toInsurerSelectValue,
  toStoredInsurer,
  useCreatePatient,
  useUpdatePatient,
  type PatientFormValues,
} from "@/features/patients";
import { patientFullName, type Patient } from "@/types";

const blankPatient: PatientFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  insurer: SELF_PAY,
  notes: "",
};

function toFormValues(patient: Patient): PatientFormValues {
  return {
    firstName: patient.firstName,
    lastName: patient.lastName,
    email: patient.email,
    phone: patient.phone,
    dateOfBirth: patient.dateOfBirth,
    insurer: toInsurerSelectValue(patient.insurer),
    notes: patient.notes,
  };
}

export function PatientFormDialog({
  open,
  onOpenChange,
  patient,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when editing, absent when adding. */
  patient?: Patient | null;
}) {
  const create = useCreatePatient();
  const update = useUpdatePatient();
  const isEditing = Boolean(patient);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: patient ? toFormValues(patient) : blankPatient,
    mode: "onBlur",
  });

  useEffect(() => {
    if (!open) return;
    form.reset(patient ? toFormValues(patient) : blankPatient);
  }, [form, open, patient]);

  const isPending = create.isPending || update.isPending;

  function onSubmit(values: PatientFormValues) {
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      dateOfBirth: values.dateOfBirth,
      insurer: toStoredInsurer(values.insurer),
      notes: values.notes,
    };

    const onError = (error: unknown) => {
      toast.error(isEditing ? "Changes not saved" : "Patient not added", {
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Check the details and try again.",
      });
    };

    if (patient) {
      update.mutate(
        { id: patient.id, patch: payload },
        {
          onSuccess: (saved) => {
            toast.success("Patient updated", {
              description: `${patientFullName(saved)}'s record is up to date.`,
            });
            onOpenChange(false);
          },
          onError,
        },
      );
      return;
    }

    create.mutate(payload, {
      onSuccess: (saved) => {
        toast.success("Patient added", {
          description: `${patientFullName(saved)} is on the list.`,
        });
        onOpenChange(false);
      },
      onError,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit patient" : "Add a patient"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Front-desk details. Clinical notes live on the record itself."
              : "For patients who call or walk in. Online bookings create their own record."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="patient-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-5 sm:grid-cols-2"
            noValidate
          >
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input autoComplete="given-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input autoComplete="family-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile</FormLabel>
                  <FormControl>
                    <Input inputMode="tel" placeholder="+971 50 123 4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="insurer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insurance</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={SELF_PAY}>Self-pay</SelectItem>
                      {insurers.map((insurer) => (
                        <SelectItem key={insurer} value={insurer}>
                          {insurer}
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
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Allergies, anxieties, preferred times, who to bill."
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
          <Button type="submit" form="patient-form" disabled={isPending}>
            {isPending ? "Saving…" : isEditing ? "Save changes" : "Add patient"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
