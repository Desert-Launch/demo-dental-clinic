"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, Clock, SearchX } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryIcons } from "@/features/services/components/service-card";
import { serviceFilterSchema, useServices } from "@/features/services";
import { cn, formatAED, formatDuration } from "@/lib/utils";
import {
  serviceCategories,
  serviceCategoryLabels,
  type Service,
  type ServiceCategory,
} from "@/types";

const filters: { value: ServiceCategory | "all"; label: string }[] = [
  { value: "all", label: "All treatments" },
  ...serviceCategories.map((category) => ({
    value: category,
    label: serviceCategoryLabels[category],
  })),
];

export function ServiceExplorer() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { data: services, isLoading } = useServices();

  const active = useMemo(() => {
    const parsed = serviceFilterSchema.safeParse({
      category: searchParams.get("category") ?? "all",
      search: "",
    });
    return parsed.success ? parsed.data.category : "all";
  }, [searchParams]);

  const visible = services?.filter(
    (service) => active === "all" || service.category === active,
  );

  function selectCategory(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("category");
    else params.set("category", value);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <>
      <div
        role="group"
        aria-label="Filter treatments by category"
        className="flex flex-wrap gap-2"
      >
        {filters.map((filter) => {
          const isActive = filter.value === active;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => selectCategory(filter.value)}
              aria-pressed={isActive}
              className={cn(
                "h-10 rounded-full border px-4 text-body font-medium transition-colors",
                isActive
                  ? "border-brand-700 bg-brand-700 text-ink-0"
                  : "border-border bg-surface text-ink-700 hover:border-brand-300 hover:text-brand-800",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : visible && visible.length > 0 ? (
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {visible.map((service) => (
            <ServiceDetailCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={SearchX}
          title="Nothing in that category yet"
          description="We are adding treatments here soon. In the meantime, the full list is one tap away."
          action={
            <Button type="button" onClick={() => selectCategory("all")}>
              Show all treatments
            </Button>
          }
          className="mt-10"
        />
      )}
    </>
  );
}

function ServiceDetailCard({ service }: { service: Service }) {
  const Icon = categoryIcons[service.category];

  return (
    <article className="flex flex-col rounded-xl border border-border bg-surface p-7">
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-subtitle font-semibold text-ink-900">{service.name}</h2>
            {service.popular ? (
              <Badge className="bg-mint-200 text-brand-900">Most booked</Badge>
            ) : null}
          </div>
          <p className="mt-2 text-body text-ink-600">{service.description}</p>
        </div>
      </div>

      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {service.includes.map((item) => (
          <li key={item} className="flex items-start gap-2 text-small text-ink-700">
            <Check className="mt-0.5 size-3.5 shrink-0 text-mint-600" aria-hidden />
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-border pt-5">
        <div>
          <p
            data-numeric
            className="font-display text-title font-semibold text-brand-800"
          >
            {formatAED(service.priceAED)}
          </p>
          <p className="text-small text-ink-500">
            {service.priceNote ?? "per visit"} ·{" "}
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden />
              {formatDuration(service.durationMinutes)}
            </span>
          </p>
        </div>
        <Button asChild>
          <Link href={`/book?service=${service.slug}`}>Book this treatment</Link>
        </Button>
      </div>
    </article>
  );
}
