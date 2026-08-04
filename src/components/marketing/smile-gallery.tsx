import { SmileTile } from "@/components/shared/gradient-art";
import { RevealOnView } from "@/components/shared/reveal";
import { Section, SectionHeading } from "@/components/shared/section";

const cases = [
  {
    id: "whitening",
    title: "In-clinic whitening",
    detail: "One 75-minute session, shade A3 to A1",
  },
  {
    id: "veneers",
    title: "Six porcelain veneers",
    detail: "Upper front teeth, three visits over four weeks",
  },
  {
    id: "aligners",
    title: "Clear aligners",
    detail: "Crowding corrected in 11 months",
  },
];

export function SmileGallery() {
  return (
    <Section className="bg-surface-muted/70">
      <SectionHeading
        eyebrow="Before and after"
        title="Results we can show you in person"
        lead="Illustrations, not photographs — real case photos are shared in the chair, with the patient's written consent."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {cases.map((item, index) => (
          <RevealOnView key={item.id} delay={index * 0.06}>
            <figure className="rounded-xl border border-border bg-surface p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SmileTile seed={item.id} tone="before" className="aspect-[8/5]" />
                  <p className="mt-2 text-center text-micro uppercase text-ink-500">
                    Before
                  </p>
                </div>
                <div>
                  <SmileTile seed={`${item.id}-after`} tone="after" className="aspect-[8/5]" />
                  <p className="mt-2 text-center text-micro uppercase text-brand-600">
                    After
                  </p>
                </div>
              </div>
              <figcaption className="mt-5 border-t border-border pt-4">
                <p className="text-subtitle font-semibold text-ink-900">{item.title}</p>
                <p className="mt-1 text-body text-ink-600">{item.detail}</p>
              </figcaption>
            </figure>
          </RevealOnView>
        ))}
      </div>
    </Section>
  );
}
