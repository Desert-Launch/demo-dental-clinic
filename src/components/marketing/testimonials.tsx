import { Star } from "lucide-react";

import { RevealOnView } from "@/components/shared/reveal";
import { Section, SectionHeading } from "@/components/shared/section";

/** Fictional patients, written the way real reviews read. */
const testimonials = [
  {
    quote:
      "I avoided dentists for fifteen years. Dr. Nair talked me through every step before she did it, and not once did I feel rushed.",
    name: "Hessa A.",
    area: "Jumeirah",
    treatment: "Wisdom tooth removal",
  },
  {
    quote:
      "Booked online at 9 pm with a broken filling, seen at 10 the next morning. The price I was quoted was the price I paid.",
    name: "Marek K.",
    area: "Business Bay",
    treatment: "Emergency filling",
  },
  {
    quote:
      "My daughter asks when we are going back, which I did not expect to type. Dr. Barakat is very good with children.",
    name: "Rania D.",
    area: "Al Safa",
    treatment: "Family check-up",
  },
];

export function Testimonials() {
  return (
    <Section>
      <SectionHeading
        eyebrow="In their words"
        title="What patients say afterwards"
        align="center"
      />

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <RevealOnView key={testimonial.name} delay={index * 0.06} className="h-full">
            <figure className="flex h-full flex-col rounded-xl border border-border bg-surface p-7">
              <div className="flex gap-0.5" aria-label="Rated 5 out of 5">
                {Array.from({ length: 5 }, (_, star) => (
                  <Star
                    key={star}
                    className="size-4 fill-sand-400 text-sand-500"
                    aria-hidden
                  />
                ))}
              </div>
              <blockquote className="mt-5 text-lead text-ink-800">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-auto pt-6 text-small">
                <span className="font-medium text-ink-900">{testimonial.name}</span>
                <span className="text-ink-500">
                  {" "}
                  · {testimonial.area} · {testimonial.treatment}
                </span>
              </figcaption>
            </figure>
          </RevealOnView>
        ))}
      </div>
    </Section>
  );
}
