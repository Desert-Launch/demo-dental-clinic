import Link from "next/link";
import { Languages } from "lucide-react";

import { ArchPortrait } from "@/components/shared/gradient-art";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { serviceCategoryLabels, type Dentist } from "@/types";

export function DentistCard({
  dentist,
  className,
  withBio = false,
}: {
  dentist: Dentist;
  className?: string;
  withBio?: boolean;
}) {
  return (
    <article className={cn("group flex flex-col", className)}>
      <ArchPortrait
        name={dentist.name}
        variant={dentist.portrait}
        className="aspect-[3/4] w-full transition-transform duration-500 ease-[var(--ease-soft)] group-hover:-translate-y-1"
      />
      <div className="mt-5">
        <h3 className="text-subtitle font-semibold text-ink-900">{dentist.name}</h3>
        <p className="mt-1 text-body text-brand-700">{dentist.role}</p>
        <p className="mt-1 text-small text-ink-500">{dentist.credentials}</p>

        {withBio ? <p className="mt-4 text-body text-ink-700">{dentist.bio}</p> : null}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {dentist.specialties.map((specialty) => (
            <Badge key={specialty} variant="outline" className="text-ink-600">
              {serviceCategoryLabels[specialty]}
            </Badge>
          ))}
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-small text-ink-500">
          <Languages className="size-3.5" aria-hidden />
          {dentist.languages.join(", ")}
        </p>
      </div>
    </article>
  );
}

export function DentistPickLink({ dentist }: { dentist: Dentist }) {
  return (
    <Link
      href={`/book?dentist=${dentist.id}`}
      className="mt-4 inline-flex text-small font-medium text-brand-700 underline-offset-4 hover:underline"
    >
      Book with {dentist.name}
    </Link>
  );
}

export function DentistCardSkeleton() {
  return (
    <div>
      <div className="arch aspect-[3/4] w-full animate-pulse bg-ink-100" />
      <div className="mt-5 h-5 w-2/3 animate-pulse rounded bg-ink-100" />
      <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-ink-100" />
    </div>
  );
}
