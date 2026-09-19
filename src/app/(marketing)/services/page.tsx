import { Suspense } from "react";
import type { Metadata } from "next";

import { CtaBand } from "@/components/marketing/cta-band";
import { MarketingPageHeader } from "@/components/marketing/page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceExplorer } from "@/features/services/components/service-explorer";

export const metadata: Metadata = {
  title: "Treatments and prices",
  description:
    "General, cosmetic, orthodontic and surgical dentistry in Dubai, with prices in AED and no surprises at the desk.",
};

export default function ServicesPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="Treatments"
        title="Every treatment, with the price next to it"
        lead="What you see is what you pay. Anything that needs a lab, a scan or more than one visit gets a written quote before we begin."
      />

      <PageContainer className="py-14 sm:py-16">
        <Suspense fallback={<Skeleton className="h-10 w-full max-w-xl rounded-full" />}>
          <ServiceExplorer />
        </Suspense>
      </PageContainer>

      <CtaBand />
    </>
  );
}
