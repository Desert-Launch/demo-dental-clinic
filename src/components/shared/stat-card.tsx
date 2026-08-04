import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  /** Percentage change against the previous period. */
  trend?: number | null;
  className?: string;
}) {
  const hasTrend = typeof trend === "number" && Number.isFinite(trend);
  const up = hasTrend && trend > 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-xs)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-small text-ink-600">{label}</p>
        <span className="flex size-8 items-center justify-center rounded-lg bg-mint-100 text-brand-700">
          <Icon className="size-4" aria-hidden />
        </span>
      </div>

      <p
        data-numeric
        className="mt-3 font-display text-display-3 leading-none font-semibold text-ink-950"
      >
        {value}
      </p>

      <div className="mt-2 flex items-center gap-2">
        {hasTrend ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-small font-medium",
              up ? "text-success-700" : "text-sand-600",
            )}
          >
            {up ? (
              <TrendingUp className="size-3.5" aria-hidden />
            ) : (
              <TrendingDown className="size-3.5" aria-hidden />
            )}
            <span data-numeric>
              {up ? "+" : ""}
              {trend.toFixed(0)}%
            </span>
          </span>
        ) : null}
        {hint ? <p className="text-small text-ink-500">{hint}</p> : null}
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-9 w-20" />
      <Skeleton className="mt-3 h-4 w-32" />
    </div>
  );
}
