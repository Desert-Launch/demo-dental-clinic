import Link from "next/link";

import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** The mark: a Gulf arch holding a drop of water — cleanliness, calm. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      role="presentation"
      aria-hidden="true"
      className={cn("size-9", className)}
    >
      <path
        d="M16 2c-6.075 0-11 4.925-11 11v15a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V13c0-6.075-4.925-11-11-11Z"
        className="fill-brand-700"
      />
      <path
        d="M16 9.5c3.2 3.55 5 6.2 5 8.65a5 5 0 1 1-10 0c0-2.45 1.8-5.1 5-8.65Z"
        className="fill-mint-300"
      />
    </svg>
  );
}

export function Logo({
  className,
  tone = "dark",
  withArabic = true,
}: {
  className?: string;
  tone?: "dark" | "light";
  withArabic?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label={`${site.name} — home`}
    >
      <LogoMark className="size-9 transition-transform duration-300 ease-[var(--ease-soft)] group-hover:-translate-y-0.5" />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[1.0625rem] font-semibold tracking-[-0.02em]",
            tone === "light" ? "text-ink-0" : "text-ink-900",
          )}
        >
          Demo{" "}
          <span
            className={cn(
              "font-normal",
              tone === "light" ? "text-mint-200" : "text-brand-600",
            )}
          >
            Dental Clinic
          </span>
        </span>
        {withArabic ? (
          <span
            lang="ar"
            dir="rtl"
            className={cn(
              "font-arabic mt-1 text-[0.6875rem]",
              tone === "light" ? "text-brand-200/80" : "text-ink-500",
            )}
          >
            {site.nameArabic}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
