import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { MarketingPageHeader } from "@/components/marketing/page-header";
import { PageContainer } from "@/components/layout/page-container";
import { StaticMap } from "@/components/shared/static-map";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/features/contact/components/contact-form";
import { clinicHours, site } from "@/lib/site";
import { formatMinutesOfDay } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description: `Call ${site.phone}, message the front desk, or book online at ${site.name} in Jumeirah 1, Dubai.`,
};

export default function ContactPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="Contact"
        title="Talk to the front desk"
        lead="For anything time-sensitive — pain, swelling, a broken tooth — call us. For everything else, the form below reaches the same three people."
      />

      <PageContainer className="grid gap-12 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 sm:py-16">
        <ContactForm />

        <div className="flex flex-col gap-8">
          <div className="rounded-xl border border-border bg-surface p-7">
            <h2 className="text-title">Reach us directly</h2>
            <ul className="mt-6 space-y-5">
              <ContactRow icon={Phone} label="Call the clinic" value={site.phone} href={site.phoneHref} />
              <ContactRow
                icon={MessageCircle}
                label="WhatsApp"
                value={site.whatsapp}
                href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`}
              />
              <ContactRow
                icon={Mail}
                label="Email"
                value={site.email}
                href={`mailto:${site.email}`}
              />
              <ContactRow
                icon={MapPin}
                label="Visit"
                value={`${site.address.line1}, ${site.address.line2}`}
              />
            </ul>

            <Button asChild size="lg" className="mt-7 w-full">
              <Link href="/book">
                <CalendarPlus aria-hidden />
                Book appointment
              </Link>
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-surface p-7">
            <h2 className="text-title">When we are open</h2>
            <dl className="mt-5 space-y-2">
              {clinicHours.map((day) => (
                <div key={day.label} className="flex justify-between gap-6 text-body">
                  <dt className="text-ink-700">{day.label}</dt>
                  <dd data-numeric className="text-ink-600">
                    {day.opens === null || day.closes === null
                      ? "Closed"
                      : `${formatMinutesOfDay(day.opens)} – ${formatMinutesOfDay(day.closes)}`}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <StaticMap className="aspect-4/3 w-full" label={site.address.line2} />
        </div>
      </PageContainer>
    </>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <li className="flex gap-3.5">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-mint-100 text-brand-700">
        <Icon className="size-4" aria-hidden />
      </span>
      <div>
        <p className="text-small text-ink-500">{label}</p>
        {href ? (
          <a
            href={href}
            className="text-body font-medium text-ink-900 underline-offset-4 hover:text-brand-700 hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="text-body font-medium text-ink-900">{value}</p>
        )}
      </div>
    </li>
  );
}
