"use client";

import Link from "next/link";
import { ArrowRight, Stethoscope } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { RevealOnView } from "@/components/shared/reveal";
import { Section, SectionHeading } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import {
  ServiceCard,
  ServiceCardSkeleton,
} from "@/features/services/components/service-card";
import { useServices } from "@/features/services";

export function FeaturedServices() {
  const { data: services, isLoading } = useServices();
  const featured = services
    ?.slice()
    .sort((a, b) => Number(b.popular) - Number(a.popular))
    .slice(0, 6);

  return (
    <Section id="treatments">
      <SectionHeading
        eyebrow="Treatments"
        title="What most people come in for"
        lead="Every price below is what you pay — consultation, materials and follow-up included. Anything more involved gets a written quote first."
        action={
          <Button asChild variant="outline">
            <Link href="/services">
              All treatments
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        }
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }, (_, index) => <ServiceCardSkeleton key={index} />)
          : featured?.map((service, index) => (
              <RevealOnView key={service.id} delay={index * 0.05} className="h-full">
                <ServiceCard service={service} className="h-full" />
              </RevealOnView>
            ))}
      </div>

      {!isLoading && featured?.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="Treatments are being updated"
          description="Our price list is between revisions. Call the clinic and we will talk you through it."
          action={
            <Button asChild>
              <Link href="/contact">Contact the clinic</Link>
            </Button>
          }
          className="mt-12"
        />
      ) : null}
    </Section>
  );
}
