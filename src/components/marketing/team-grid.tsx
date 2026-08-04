"use client";

import { RevealOnView } from "@/components/shared/reveal";
import {
  DentistCard,
  DentistCardSkeleton,
  DentistPickLink,
} from "@/features/dentists/components/dentist-card";
import { useDentists } from "@/features/dentists";

/** The about page's full-bio version of the team. */
export function TeamGrid() {
  const { data: dentists, isLoading } = useDentists();

  return (
    <div className="mt-12 grid gap-10 sm:grid-cols-2">
      {isLoading
        ? Array.from({ length: 4 }, (_, index) => <DentistCardSkeleton key={index} />)
        : dentists?.map((dentist, index) => (
            <RevealOnView key={dentist.id} delay={index * 0.05}>
              <DentistCard dentist={dentist} withBio />
              <DentistPickLink dentist={dentist} />
            </RevealOnView>
          ))}
    </div>
  );
}
