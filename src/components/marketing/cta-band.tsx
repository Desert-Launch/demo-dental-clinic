import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export function CtaBand() {
  return (
    <section className="py-16 sm:py-24">
      <PageContainer>
        <div className="relative isolate overflow-hidden rounded-3xl bg-surface-brand px-8 py-16 sm:px-14 sm:py-20">
          <span
            aria-hidden
            className="absolute -top-24 -right-16 size-96 rounded-full bg-mint-500/20 blur-3xl"
          />
          <svg
            aria-hidden
            viewBox="0 0 600 200"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-32 w-full opacity-30"
          >
            <g stroke="var(--mint-300)" strokeOpacity="0.4" fill="none" strokeWidth="1.5">
              <path d="M-20 180c120-90 340-90 460 0" />
              <path d="M40 190c120-90 340-90 460 0" />
              <path d="M100 200c120-90 340-90 460 0" />
            </g>
          </svg>

          <div className="relative max-w-2xl">
            <h2 className="text-display-2 text-ink-0">
              Book in under a minute. Cancel free up to 24 hours before.
            </h2>
            <p className="mt-5 text-lead text-brand-200">
              Pick a treatment, pick a time, and you are done. We will send a reminder
              two days before, and again the morning of.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="xl" className="bg-mint-300 text-brand-950 hover:bg-mint-200">
                <Link href="/book">
                  Book appointment
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="border-brand-700 bg-transparent text-brand-100 hover:bg-brand-900 hover:text-ink-0"
              >
                <a href={site.phoneHref}>
                  <Phone aria-hidden />
                  {site.phone}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
