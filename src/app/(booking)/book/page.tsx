import { Suspense } from "react";
import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingWizard } from "@/features/booking/components/booking-wizard";

export const metadata: Metadata = {
  title: "Book an appointment",
  description:
    "Pick a treatment, a dentist and a time. Booking takes under a minute and nothing is charged online.",
};

export default function BookPage() {
  return (
    <PageContainer className="py-10 sm:py-14">
      <Suspense fallback={<WizardSkeleton />}>
        <BookingWizard />
      </Suspense>
    </PageContainer>
  );
}

function WizardSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
      <div>
        <Skeleton className="h-8 w-full max-w-md rounded-full" />
        <Skeleton className="mt-9 h-10 w-72" />
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}
