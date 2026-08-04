import Link from "next/link";
import { ArrowRight, Clock, Grip, Sparkles, Stethoscope, Syringe } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn, formatAED, formatDuration } from "@/lib/utils";
import { serviceCategoryLabels, type Service, type ServiceCategory } from "@/types";

export const categoryIcons: Record<ServiceCategory, LucideIcon> = {
  general: Stethoscope,
  cosmetic: Sparkles,
  orthodontics: Grip,
  surgery: Syringe,
};

const categoryTint: Record<ServiceCategory, string> = {
  general: "bg-brand-50 text-brand-700",
  cosmetic: "bg-mint-100 text-brand-800",
  orthodontics: "bg-sand-100 text-sand-600",
  surgery: "bg-ink-100 text-ink-700",
};

export function ServiceCard({
  service,
  className,
}: {
  service: Service;
  className?: string;
}) {
  const Icon = categoryIcons[service.category];

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-xl border border-border bg-surface p-6 transition-all duration-300 ease-[var(--ease-soft)] hover:-translate-y-1 hover:border-brand-200 hover:shadow-[var(--shadow-lg)] focus-within:-translate-y-1 focus-within:border-brand-200",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-lg",
            categoryTint[service.category],
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        {service.popular ? (
          <Badge className="bg-mint-200 text-brand-900">Most booked</Badge>
        ) : (
          <Badge variant="outline" className="text-ink-600">
            {serviceCategoryLabels[service.category]}
          </Badge>
        )}
      </div>

      <h3 className="mt-5 text-subtitle font-semibold text-ink-900">
        <Link href={`/book?service=${service.slug}`} className="after:absolute after:inset-0">
          {service.name}
        </Link>
      </h3>
      <p className="mt-2 text-body text-ink-600">{service.summary}</p>

      <div className="mt-6 flex items-end justify-between gap-4 border-t border-border pt-4">
        <div>
          <p data-numeric className="font-display text-subtitle font-semibold text-brand-800">
            {formatAED(service.priceAED)}
          </p>
          <p className="text-small text-ink-500">{service.priceNote ?? "per visit"}</p>
        </div>
        <p className="flex items-center gap-1.5 text-small text-ink-600">
          <Clock className="size-3.5" aria-hidden />
          {formatDuration(service.durationMinutes)}
        </p>
      </div>

      <span
        aria-hidden
        className="mt-4 inline-flex items-center gap-1.5 text-small font-medium text-brand-700 transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-0.5"
      >
        Book this treatment
        <ArrowRight className="size-3.5" />
      </span>
    </article>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="flex h-full min-h-[17rem] flex-col rounded-xl border border-border bg-surface p-6">
      <div className="size-11 animate-pulse rounded-lg bg-ink-100" />
      <div className="mt-5 h-5 w-3/4 animate-pulse rounded bg-ink-100" />
      <div className="mt-3 h-4 w-full animate-pulse rounded bg-ink-100" />
      <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-ink-100" />
      <div className="mt-auto h-10 w-full animate-pulse rounded bg-ink-100" />
    </div>
  );
}
