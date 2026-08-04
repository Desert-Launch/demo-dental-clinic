import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Empty states invite the next action rather than reporting an absence.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-muted/60 px-6 py-14 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-mint-100 text-brand-700">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="mt-5 font-display text-subtitle font-semibold text-ink-900">{title}</p>
      <p className="mt-2 max-w-sm text-body text-ink-600">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
