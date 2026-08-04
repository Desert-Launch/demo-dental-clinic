import { CarFront, HeartPulse, Languages, ShieldCheck } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { insurers } from "@/features/patients";
import { site } from "@/lib/site";

const assurances = [
  {
    icon: ShieldCheck,
    title: "Direct insurance billing",
    detail: "We settle with your insurer, you pay the difference.",
  },
  {
    icon: CarFront,
    title: "Free parking",
    detail: site.parking,
  },
  {
    icon: Languages,
    title: "Six languages",
    detail: "Arabic, English, French, Hindi, Malayalam, Urdu.",
  },
  {
    icon: HeartPulse,
    title: "Sedation available",
    detail: "For anxious patients and longer surgical visits.",
  },
];

export function AssuranceStrip() {
  return (
    <section className="border-y border-border bg-surface">
      <PageContainer className="py-12">
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {assurances.map((item) => (
            <li key={item.title} className="flex gap-3.5">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-mint-100 text-brand-700">
                <item.icon className="size-4.5" aria-hidden />
              </span>
              <div>
                <p className="text-body font-semibold text-ink-900">{item.title}</p>
                <p className="mt-1 text-small text-ink-600">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-8">
          <p className="text-micro uppercase text-ink-500">Insurers we bill directly</p>
          {insurers.map((insurer) => (
            <span key={insurer} className="text-body font-medium text-ink-600">
              {insurer}
            </span>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
