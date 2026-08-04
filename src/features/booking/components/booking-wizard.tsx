"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  BookingSummary,
  type BookingDraft,
} from "@/features/booking/components/booking-summary";
import { SlotPicker } from "@/features/booking/components/slot-picker";
import { StepConfirmation } from "@/features/booking/components/step-confirmation";
import {
  StepDetails,
  emptyBookingDetails,
} from "@/features/booking/components/step-details";
import { StepDentist } from "@/features/booking/components/step-dentist";
import { StepTreatment } from "@/features/booking/components/step-treatment";
import { WizardStepper } from "@/features/booking/components/wizard-stepper";
import {
  NO_PREFERENCE,
  bookingStepMeta,
  useSubmitBooking,
  type BookingDetailsValues,
  type BookingResult,
  type BookingStep,
} from "@/features/booking";
import { useDentists } from "@/features/dentists";
import { useServices } from "@/features/services";

const emptyDraft: BookingDraft = {
  serviceId: null,
  dentistId: NO_PREFERENCE,
  date: null,
  startMinutes: null,
};

export function BookingWizard() {
  const searchParams = useSearchParams();
  const { data: services } = useServices();
  const { data: dentists } = useDentists();
  const { mutate: submit, isPending } = useSubmitBooking();

  const [step, setStep] = useState<BookingStep>("treatment");
  const [direction, setDirection] = useState(1);
  const [draft, setDraft] = useState<BookingDraft>(emptyDraft);
  const [details, setDetails] = useState<BookingDetailsValues>(emptyBookingDetails);
  const [result, setResult] = useState<BookingResult | null>(null);
  const prefilled = useRef(false);
  const reduceMotion = useReducedMotion();

  // Deep links from the marketing site: /book?service=whitening&dentist=dr_omar
  useEffect(() => {
    if (prefilled.current || !services || !dentists) return;
    prefilled.current = true;

    const serviceParam = searchParams.get("service");
    const service = services.find(
      (item) => item.slug === serviceParam || item.id === serviceParam,
    );
    if (!service) return;

    const dentistParam = searchParams.get("dentist");
    const dentist = dentists.find(
      (item) => item.id === dentistParam && item.specialties.includes(service.category),
    );

    const dateParam = searchParams.get("date");
    const timeParam = Number(searchParams.get("time"));
    const hasSlot = Boolean(dateParam) && Number.isFinite(timeParam) && timeParam > 0;

    setDraft({
      serviceId: service.id,
      dentistId: dentist?.id ?? NO_PREFERENCE,
      date: hasSlot ? dateParam : null,
      startMinutes: hasSlot ? timeParam : null,
    });
    setStep(hasSlot ? "details" : dentist ? "slot" : "dentist");
  }, [dentists, searchParams, services]);

  const goTo = useCallback((next: BookingStep, forward = true) => {
    setDirection(forward ? 1 : -1);
    setStep(next);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const canContinue =
    (step === "treatment" && Boolean(draft.serviceId)) ||
    (step === "dentist" && Boolean(draft.dentistId)) ||
    (step === "slot" && Boolean(draft.date) && draft.startMinutes !== null);

  function handleContinue() {
    if (step === "treatment") goTo("dentist");
    else if (step === "dentist") goTo("slot");
    else if (step === "slot") goTo("details");
  }

  function handleBack() {
    if (step === "dentist") goTo("treatment", false);
    else if (step === "slot") goTo("dentist", false);
    else if (step === "details") goTo("slot", false);
  }

  function handleSubmit(values: BookingDetailsValues) {
    setDetails(values);
    if (!draft.serviceId || !draft.date || draft.startMinutes === null) return;

    submit(
      {
        serviceId: draft.serviceId,
        dentistId: draft.dentistId,
        date: draft.date,
        startMinutes: draft.startMinutes,
        details: values,
      },
      {
        onSuccess: (booking) => {
          setResult(booking);
          goTo("done");
          toast.success("Booking confirmed", {
            description: `${booking.appointment.reference} — ${booking.appointment.service.name} with ${booking.appointment.dentist.name}.`,
          });
        },
        onError: (error) => {
          toast.error("Booking not saved", {
            description:
              error instanceof Error
                ? error.message
                : "Something went wrong. Pick another time and try again.",
          });
          goTo("slot", false);
          setDraft((current) => ({ ...current, startMinutes: null }));
        },
      },
    );
  }

  function resetWizard() {
    setDraft(emptyDraft);
    setDetails(emptyBookingDetails);
    setResult(null);
    goTo("treatment", false);
  }

  const meta = bookingStepMeta[step];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
      <div>
        <WizardStepper
          current={step}
          onStepSelect={(target) => goTo(target, false)}
        />

        {step === "done" ? null : (
          <div className="mt-9">
            <p className="eyebrow">{meta.title}</p>
            <h1 className="mt-2 text-display-3 text-ink-950">{meta.caption}</h1>
          </div>
        )}

        <div className="mt-8">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={reduceMotion ? false : { opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: direction * -24 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === "treatment" ? (
                <StepTreatment
                  serviceId={draft.serviceId}
                  onSelect={(serviceId) =>
                    setDraft((current) => ({
                      ...current,
                      serviceId,
                      // A different treatment can mean a different team and length.
                      dentistId: NO_PREFERENCE,
                      date: null,
                      startMinutes: null,
                    }))
                  }
                />
              ) : null}

              {step === "dentist" && draft.serviceId ? (
                <StepDentist
                  serviceId={draft.serviceId}
                  dentistId={draft.dentistId}
                  onSelect={(dentistId) =>
                    setDraft((current) => ({
                      ...current,
                      dentistId,
                      startMinutes: null,
                    }))
                  }
                />
              ) : null}

              {step === "slot" && draft.serviceId ? (
                <SlotPicker
                  serviceId={draft.serviceId}
                  dentistId={draft.dentistId}
                  date={draft.date}
                  startMinutes={draft.startMinutes}
                  onSelectDate={(date) =>
                    setDraft((current) => ({ ...current, date }))
                  }
                  onSelectSlot={(startMinutes) =>
                    setDraft((current) => ({ ...current, startMinutes }))
                  }
                />
              ) : null}

              {step === "details" ? (
                <StepDetails
                  defaultValues={details}
                  isSubmitting={isPending}
                  onBack={handleBack}
                  onSubmit={handleSubmit}
                />
              ) : null}

              {step === "done" && result ? (
                <StepConfirmation result={result} onBookAnother={resetWizard} />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        {step !== "details" && step !== "done" ? (
          <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            {step === "treatment" ? (
              <span />
            ) : (
              <Button type="button" variant="outline" size="lg" onClick={handleBack}>
                <ArrowLeft aria-hidden />
                Back
              </Button>
            )}
            <Button
              type="button"
              size="lg"
              onClick={handleContinue}
              disabled={!canContinue}
            >
              Continue
              <ArrowRight aria-hidden />
            </Button>
          </div>
        ) : null}
      </div>

      {step === "done" ? null : (
        <BookingSummary draft={draft} className="lg:sticky lg:top-24 lg:self-start" />
      )}
    </div>
  );
}
