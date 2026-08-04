import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Phone } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { PageContainer } from "@/components/layout/page-container";
import { site } from "@/lib/site";

/** The booking flow drops the marketing chrome so nothing competes with it. */
export default function BookingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border bg-surface">
        <PageContainer className="flex h-[4.5rem] items-center justify-between gap-4">
          <Logo withArabic={false} />
          <div className="flex items-center gap-1">
            <a
              href={site.phoneHref}
              className="hidden items-center gap-2 rounded-md px-3 py-2 text-body font-medium text-ink-700 transition-colors hover:text-brand-700 sm:inline-flex"
            >
              <Phone className="size-4" aria-hidden />
              {site.phone}
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-body font-medium text-ink-700 transition-colors hover:text-brand-700"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back to site
            </Link>
          </div>
        </PageContainer>
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border bg-surface">
        <PageContainer className="flex flex-wrap items-center justify-between gap-3 py-6 text-small text-ink-500">
          <p>No card needed · Free cancellation up to 24 hours before</p>
          <p>
            {site.address.line1}, {site.address.line2}
          </p>
        </PageContainer>
      </footer>
    </div>
  );
}
