"use client";

import { Check, Sparkles } from "lucide-react";

import { ArchPortrait } from "@/components/shared/gradient-art";
import { Skeleton } from "@/components/ui/skeleton";
import { NO_PREFERENCE } from "@/features/booking";
import { useDentistsForService } from "@/features/dentists";
import { cn } from "@/lib/utils";
import { clinicHours } from "@/lib/site";

export function StepDentist({
  serviceId,
  dentistId,
  onSelect,
}: {
  serviceId: string;
  dentistId: string;
  onSelect: (dentistId: string) => void;
}) {
  const { data: dentists, isLoading } = useDentistsForService(serviceId);

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div role="group" aria-label="Choose a dentist" className="grid gap-3 sm:grid-cols-2">
      <OptionCard
        selected={dentistId === NO_PREFERENCE}
        onSelect={() => onSelect(NO_PREFERENCE)}
        title="No preference"
        subtitle="Whoever is free soonest"
        detail="We assign the first available dentist who does this treatment — usually the fastest way in."
        className="sm:col-span-2"
        media={
          <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-mint-100 text-brand-700">
            <Sparkles className="size-6" aria-hidden />
          </span>
        }
      />

      {dentists?.map((dentist) => (
        <OptionCard
          key={dentist.id}
          selected={dentistId === dentist.id}
          onSelect={() => onSelect(dentist.id)}
          title={dentist.name}
          subtitle={dentist.role}
          detail={`In ${workingDayLabel(dentist.workingDays)} · ${dentist.languages.join(", ")}`}
          media={
            <ArchPortrait
              name={dentist.name}
              variant={dentist.portrait}
              className="size-14 shrink-0"
            />
          }
        />
      ))}
    </div>
  );
}

function OptionCard({
  selected,
  onSelect,
  title,
  subtitle,
  detail,
  media,
  className,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  subtitle: string;
  detail: string;
  media: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "relative flex items-center gap-4 rounded-xl border p-5 text-left transition-all duration-200 ease-[var(--ease-soft)]",
        selected
          ? "border-brand-700 bg-brand-50 shadow-[var(--shadow-sm)]"
          : "border-border bg-surface hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-[var(--shadow-md)]",
        className,
      )}
    >
      {media}
      <span className="min-w-0 flex-1">
        <span className="block text-body font-semibold text-ink-900">{title}</span>
        <span className="mt-0.5 block text-small text-brand-700">{subtitle}</span>
        <span className="mt-1.5 block text-small text-ink-600">{detail}</span>
      </span>
      {selected ? (
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-700 text-ink-0">
          <Check className="size-3.5" aria-hidden />
        </span>
      ) : null}
    </button>
  );
}

/** `[1,2,3,4,6]` → `Mon, Tue, Wed, Thu, Sat`. */
function workingDayLabel(workingDays: number[]): string {
  return clinicHours
    .filter((day) => workingDays.includes(day.weekday))
    .map((day) => day.shortLabel)
    .join(", ");
}
