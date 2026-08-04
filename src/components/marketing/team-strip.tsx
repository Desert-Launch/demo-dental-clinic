"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { RevealOnView } from "@/components/shared/reveal";
import { Section, SectionHeading } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import {
  DentistCard,
  DentistCardSkeleton,
} from "@/features/dentists/components/dentist-card";
import { useDentists } from "@/features/dentists";

export function TeamStrip() {
  const { data: dentists, isLoading } = useDentists();

  return (
    <Section className="bg-surface-muted/70">
      <SectionHeading
        eyebrow="The team"
        title="Four dentists, one waiting room"
        lead="Small on purpose. You see the same person each visit, and they remember what you told them last time."
        action={
          <Button asChild variant="outline">
            <Link href="/about">
              More about the studio
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        }
      />

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }, (_, index) => <DentistCardSkeleton key={index} />)
          : dentists?.map((dentist, index) => (
              <RevealOnView key={dentist.id} delay={index * 0.06}>
                <DentistCard dentist={dentist} />
              </RevealOnView>
            ))}
      </div>
    </Section>
  );
}
