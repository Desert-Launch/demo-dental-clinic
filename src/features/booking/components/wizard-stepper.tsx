"use client";

import { Check } from "lucide-react";

import { bookingStepMeta, bookingSteps, type BookingStep } from "@/features/booking";
import { cn } from "@/lib/utils";

const visibleSteps = bookingSteps.filter((step) => step !== "done");

export function WizardStepper({
  current,
  onStepSelect,
}: {
  current: BookingStep;
  onStepSelect: (step: BookingStep) => void;
}) {
  const currentIndex = visibleSteps.indexOf(current as (typeof visibleSteps)[number]);
  const done = current === "done";

  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
      {visibleSteps.map((step, index) => {
        const complete = done || index < currentIndex;
        const active = !done && index === currentIndex;

        return (
          <li key={step} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onStepSelect(step)}
              disabled={!complete || done}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-small font-medium transition-colors",
                active && "bg-brand-50 text-brand-800",
                complete && !done && "text-ink-700 hover:bg-surface-muted",
                !complete && !active && "text-ink-400",
                done && "text-ink-500",
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-[0.75rem] font-semibold",
                  complete
                    ? "bg-brand-700 text-ink-0"
                    : active
                      ? "bg-brand-700 text-ink-0"
                      : "bg-surface-muted text-ink-500",
                )}
              >
                {complete ? <Check className="size-3.5" aria-hidden /> : index + 1}
              </span>
              {bookingStepMeta[step].title}
            </button>
            {index < visibleSteps.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "h-px w-5 sm:w-8",
                  complete ? "bg-brand-300" : "bg-border-strong",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
