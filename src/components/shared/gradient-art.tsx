import { cn, hashToUnit, initials } from "@/lib/utils";

/**
 * Placeholder art. The clinic is fictional, so there are no photographs of real
 * people anywhere — portraits and the smile gallery are built from brand
 * gradients and the arch silhouette instead.
 */
const portraitGradients = {
  1: "from-brand-800 via-brand-600 to-mint-400",
  2: "from-brand-900 via-brand-700 to-brand-400",
  3: "from-mint-600 via-mint-500 to-sand-300",
  4: "from-brand-700 via-brand-500 to-ink-300",
} as const;

export type PortraitVariant = keyof typeof portraitGradients;

export function ArchPortrait({
  name,
  variant,
  className,
}: {
  name: string;
  variant: PortraitVariant;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "arch relative isolate overflow-hidden bg-gradient-to-br",
        portraitGradients[variant],
        className,
      )}
      role="img"
      aria-label={`Illustrated portrait placeholder for ${name}`}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-950/35 to-transparent"
      />
      <span
        aria-hidden
        className="absolute inset-0 flex items-center justify-center font-display text-[4rem] font-semibold text-ink-0/25 sm:text-[5rem]"
      >
        {initials(name.replace(/^Dr\.\s*/, ""))}
      </span>
      <svg
        aria-hidden
        viewBox="0 0 200 200"
        className="absolute inset-0 size-full opacity-40 mix-blend-soft-light"
      >
        <circle cx="150" cy="60" r="70" fill="var(--ink-0)" opacity="0.25" />
        <path
          d="M20 150c30 26 130 26 160 0"
          stroke="var(--ink-0)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

const tileGradients = [
  "from-brand-100 via-mint-100 to-ink-0",
  "from-mint-100 via-brand-100 to-ink-0",
  "from-sand-100 via-mint-100 to-ink-0",
  "from-brand-200 via-brand-100 to-mint-50",
] as const;

/**
 * One half of a before/after pair. `tone` shifts the "teeth" swatch so the pair
 * reads as an improvement without pretending to be a photograph.
 */
export function SmileTile({
  seed,
  tone,
  className,
}: {
  seed: string;
  tone: "before" | "after";
  className?: string;
}) {
  const index = Math.floor(hashToUnit(seed) * tileGradients.length) % tileGradients.length;
  const gradient = tileGradients[index] ?? tileGradients[0];
  const toothFill = tone === "after" ? "var(--ink-0)" : "var(--sand-200)";
  const gumFill = tone === "after" ? "var(--brand-200)" : "var(--brand-300)";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-gradient-to-br",
        gradient,
        className,
      )}
      role="img"
      aria-label={
        tone === "after"
          ? "Illustration of a smile after treatment"
          : "Illustration of a smile before treatment"
      }
    >
      <svg viewBox="0 0 160 100" className="size-full">
        <path d="M20 34c22-16 98-16 120 0-14 40-38 56-60 56S34 74 20 34Z" fill={gumFill} />
        {[0, 1, 2, 3, 4, 5].map((tooth) => (
          <rect
            key={tooth}
            x={34 + tooth * 15.5}
            y={tone === "after" ? 38 : 40}
            width={13}
            height={tone === "after" ? 26 : 22}
            rx={4}
            fill={toothFill}
          />
        ))}
      </svg>
    </div>
  );
}

/** The large arch panel used in the hero and on the about page. */
export function ArchPanel({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "arch relative isolate overflow-hidden bg-gradient-to-b from-brand-800 via-brand-700 to-brand-900",
        className,
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 400 520"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
      >
        <defs>
          <radialGradient id="arch-glow" cx="30%" cy="18%" r="70%">
            <stop offset="0%" stopColor="var(--mint-300)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--mint-300)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="520" fill="url(#arch-glow)" />
        <g stroke="var(--mint-200)" strokeOpacity="0.28" fill="none" strokeWidth="1.5">
          <path d="M-20 380c90-70 250-70 340 0" />
          <path d="M-20 420c90-70 250-70 340 0" />
          <path d="M-20 460c90-70 250-70 340 0" />
        </g>
        <circle cx="330" cy="120" r="86" fill="var(--ink-0)" fillOpacity="0.07" />
      </svg>
      {children}
    </div>
  );
}
