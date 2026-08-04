import { MapPin } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * An illustrated stand-in for a map. No tiles are fetched and no live map
 * provider is wired up — this is a demo.
 */
export function StaticMap({ className, label }: { className?: string; label: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-mint-50",
        className,
      )}
      role="img"
      aria-label={`Illustrated map showing the clinic at ${label}`}
    >
      <svg viewBox="0 0 400 260" className="size-full" aria-hidden>
        <rect width="400" height="260" fill="var(--mint-50)" />
        <g stroke="var(--ink-200)" strokeWidth="10" fill="none" strokeLinecap="square">
          <path d="M-10 90h420" />
          <path d="M-10 195h420" />
          <path d="M110 -10v280" />
          <path d="M290 -10v280" />
        </g>
        <g stroke="var(--ink-100)" strokeWidth="4" fill="none">
          <path d="M-10 40h420" />
          <path d="M200 -10v280" />
          <path d="M350 -10v280" />
        </g>
        <g fill="var(--ink-100)">
          <rect x="130" y="110" width="50" height="60" rx="4" />
          <rect x="215" y="110" width="55" height="35" rx="4" />
          <rect x="215" y="155" width="55" height="30" rx="4" />
          <rect x="20" y="110" width="70" height="70" rx="4" />
          <rect x="310" y="105" width="70" height="80" rx="4" />
        </g>
        <path d="M-10 220c60 20 140 20 200 4s140-12 210 8v40H-10Z" fill="var(--brand-100)" />
        <circle cx="200" cy="118" r="26" fill="var(--brand-700)" opacity="0.12" />
      </svg>

      <span className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-brand-700 text-ink-0 shadow-[var(--shadow-md)]">
          <MapPin className="size-5" aria-hidden />
        </span>
        <span className="mt-1 size-2 rotate-45 rounded-[1px] bg-brand-700" />
      </span>

      <p className="absolute bottom-3 left-3 rounded-md bg-surface/90 px-2.5 py-1 text-small font-medium text-ink-700 backdrop-blur">
        {label}
      </p>
    </div>
  );
}
