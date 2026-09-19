import type { Metadata } from "next";
import { Car, Clock3, Train } from "lucide-react";

import { CtaBand } from "@/components/marketing/cta-band";
import { MarketingPageHeader } from "@/components/marketing/page-header";
import { TeamGrid } from "@/components/marketing/team-grid";
import { ArchPanel } from "@/components/shared/gradient-art";
import { Section, SectionHeading } from "@/components/shared/section";
import { StaticMap } from "@/components/shared/static-map";
import { clinicHours, site } from "@/lib/site";
import { formatMinutesOfDay } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About the studio",
  description:
    "A four-dentist studio in Dubai, built around longer appointments and fewer patients a day.",
};

const principles = [
  {
    title: "Fewer patients a day",
    detail:
      "We book 30 to 90 minutes per chair rather than stacking fifteen-minute visits. Nobody is hurried out.",
  },
  {
    title: "The price before the treatment",
    detail:
      "Every plan comes with a written quote. If something changes mid-treatment, we stop and talk to you first.",
  },
  {
    title: "One dentist, start to finish",
    detail:
      "You keep the same clinician through a course of treatment, so nothing gets explained twice or missed once.",
  },
];

export default function AboutPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="About"
        title="A small studio, on purpose"
        lead={`${site.name} opened in Dubai in ${site.established}. Four dentists, six languages, and a diary that leaves room to answer questions.`}
      />

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-20">
          <div>
            <h2 className="text-display-3">Built by a dentist who was tired of the queue</h2>
            <div className="mt-6 space-y-5 text-lead text-ink-700">
              <p>
                The founding dentist spent ten years in practices where the diary ran
                the dentistry, and opened this clinic to try the opposite: longer
                appointments, honest quotes, and enough time to explain what is happening
                before it happens.
              </p>
              <p>
                Fourteen years later the studio still runs four chairs and no more. We
                would rather turn a day away than rush the people already in it.
              </p>
              <p>
                Everything is under one roof — hygiene, cosmetic work, aligners and oral
                surgery — so a treatment plan does not scatter you across the city.
              </p>
            </div>
          </div>
          <ArchPanel className="mx-auto aspect-[3/4] w-full max-w-sm" />
        </div>
      </Section>

      <Section className="bg-surface-muted/70">
        <SectionHeading eyebrow="How we work" title="Three things we do not bend on" />
        <ol className="mt-12 grid gap-6 lg:grid-cols-3">
          {principles.map((principle, index) => (
            <li
              key={principle.title}
              className="rounded-xl border border-border bg-surface p-7"
            >
              <span
                data-numeric
                className="font-display text-title font-semibold text-mint-600"
              >
                0{index + 1}
              </span>
              <h3 className="mt-3 text-subtitle font-semibold text-ink-900">
                {principle.title}
              </h3>
              <p className="mt-2 text-body text-ink-600">{principle.detail}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="The team"
          title="Who you will actually see"
          lead="No associates rotating through. These four are here every week."
        />
        <TeamGrid />
      </Section>

      <Section className="bg-surface-muted/70">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading eyebrow="Find us" title="Demo District, Dubai" />
            <address className="mt-8 text-lead not-italic text-ink-700">
              {site.address.line1}
              <br />
              {site.address.line2}
              <br />
              {site.address.country}
            </address>
            <ul className="mt-8 space-y-3 text-body text-ink-700">
              <li className="flex items-center gap-3">
                <Car className="size-4 text-brand-600" aria-hidden />
                {site.parking}
              </li>
              <li className="flex items-center gap-3">
                <Train className="size-4 text-brand-600" aria-hidden />
                {site.metro}
              </li>
              <li className="flex items-center gap-3">
                <Clock3 className="size-4 text-brand-600" aria-hidden />
                Late appointments until 9 pm, Monday to Friday
              </li>
            </ul>

            <h3 className="mt-12 text-title">Opening hours</h3>
            <dl className="mt-5 max-w-md divide-y divide-border rounded-xl border border-border bg-surface">
              {clinicHours.map((day) => (
                <div
                  key={day.label}
                  className="flex items-center justify-between gap-6 px-5 py-3"
                >
                  <dt className="text-body font-medium text-ink-800">{day.label}</dt>
                  <dd data-numeric className="text-body text-ink-600">
                    {day.opens === null || day.closes === null ? (
                      <span className="text-ink-500">Closed</span>
                    ) : (
                      `${formatMinutesOfDay(day.opens)} – ${formatMinutesOfDay(day.closes)}`
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 max-w-md text-small text-ink-500">
              Monday to Thursday we close between 1:30 and 2:30 pm.
            </p>
          </div>

          <StaticMap
            className="aspect-4/3 w-full lg:aspect-auto lg:h-full lg:min-h-[28rem]"
            label={`${site.address.line1}, ${site.address.line2}`}
          />
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
