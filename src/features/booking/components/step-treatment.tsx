"use client";

import { Check, Clock } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { categoryIcons } from "@/features/services/components/service-card";
import { useServices } from "@/features/services";
import { cn, formatAED, formatDuration } from "@/lib/utils";
import { serviceCategoryLabels } from "@/types";

export function StepTreatment({
  serviceId,
  onSelect,
}: {
  serviceId: string | null;
  onSelect: (serviceId: string) => void;
}) {
  const { data: services, isLoading } = useServices();

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Choose a treatment"
      className="grid gap-3 sm:grid-cols-2"
    >
      {services?.map((service) => {
        const selected = service.id === serviceId;
        const Icon = categoryIcons[service.category];
        return (
          <button
            key={service.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(service.id)}
            className={cn(
              "group relative flex items-start gap-4 rounded-xl border p-5 text-left transition-all duration-200 ease-[var(--ease-soft)]",
              selected
                ? "border-brand-700 bg-brand-50 shadow-[var(--shadow-sm)]"
                : "border-border bg-surface hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-[var(--shadow-md)]",
            )}
          >
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg",
                selected ? "bg-brand-700 text-ink-0" : "bg-mint-100 text-brand-700",
              )}
            >
              {selected ? <Check className="size-5" aria-hidden /> : <Icon className="size-5" aria-hidden />}
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-body font-semibold text-ink-900">{service.name}</span>
                <span
                  data-numeric
                  className="shrink-0 text-body font-semibold text-brand-800"
                >
                  {formatAED(service.priceAED)}
                </span>
              </span>
              <span className="mt-1 block text-small text-ink-600">{service.summary}</span>
              <span className="mt-2 flex items-center gap-3 text-small text-ink-500">
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" aria-hidden />
                  {formatDuration(service.durationMinutes)}
                </span>
                <span>·</span>
                <span>{serviceCategoryLabels[service.category]}</span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
