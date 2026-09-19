import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { LogoMark } from "@/components/layout/logo";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { clinicHours, site } from "@/lib/site";
import { formatMinutesOfDay } from "@/lib/utils";

const treatmentLinks = [
  { href: "/services?category=general", label: "General dentistry" },
  { href: "/services?category=cosmetic", label: "Cosmetic" },
  { href: "/services?category=orthodontics", label: "Orthodontics" },
  { href: "/services?category=surgery", label: "Oral surgery" },
];

const clinicLinks = [
  { href: "/about", label: "About the studio" },
  { href: "/contact", label: "Contact" },
  { href: "/book", label: "Book appointment" },
  { href: "/admin", label: "Clinic dashboard" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-surface-brand text-brand-100">
      <PageContainer className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark className="size-10" />
              <div className="leading-none">
                <p className="font-display text-subtitle font-semibold text-ink-0">
                  {site.name}
                </p>
                <p
                  lang="ar"
                  dir="rtl"
                  className="font-arabic mt-1.5 text-small text-brand-200/80"
                >
                  {site.nameArabic}
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-xs text-body text-brand-200">
              Gentle, unhurried dental care in Dubai since {site.established}.
              Same-day appointments most weekdays.
            </p>
            <Button asChild size="lg" className="mt-7 bg-mint-300 text-brand-950 hover:bg-mint-200">
              <Link href="/book">Book appointment</Link>
            </Button>
          </div>

          <FooterColumn title="Treatments" links={treatmentLinks} />
          <FooterColumn title="Clinic" links={clinicLinks} />

          <div>
            <h2 className="text-micro uppercase text-mint-300">Visit us</h2>
            <address className="mt-5 space-y-3 text-body not-italic text-brand-200">
              <p className="flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-mint-300" aria-hidden />
                <span>
                  {site.address.line1}
                  <br />
                  {site.address.line2}
                </span>
              </p>
              <p className="flex gap-2.5">
                <Phone className="mt-0.5 size-4 shrink-0 text-mint-300" aria-hidden />
                <a href={site.phoneHref} className="hover:text-ink-0">
                  {site.phone}
                </a>
              </p>
              <p className="flex gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-mint-300" aria-hidden />
                <a href={`mailto:${site.email}`} className="hover:text-ink-0">
                  {site.email}
                </a>
              </p>
            </address>

            <h2 className="mt-8 text-micro uppercase text-mint-300">Opening hours</h2>
            <dl className="mt-4 space-y-1.5 text-small text-brand-200">
              {clinicHours.map((day) => (
                <div key={day.label} className="flex justify-between gap-6">
                  <dt>{day.label}</dt>
                  <dd data-numeric className="text-right">
                    {day.opens === null || day.closes === null
                      ? "Closed"
                      : `${formatMinutesOfDay(day.opens)} – ${formatMinutesOfDay(day.closes)}`}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-brand-800/60 pt-8 text-small text-brand-300 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {site.established}–2026 {site.name}. Trade licence 000000 (Dubai).
          </p>
          <p className="text-brand-400">
            A fictional clinic built as a product demo. No real patient data.
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h2 className="text-micro uppercase text-mint-300">{title}</h2>
      <ul className="mt-5 space-y-2.5 text-body">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-brand-200 transition-colors hover:text-ink-0"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
