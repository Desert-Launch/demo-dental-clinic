import type { Metadata } from "next";

import { DEMO } from "@/lib/demo-site";

/**
 * Everything that ties this demo back to the studio that built it: the
 * metadata a share preview or a crawler reads, and the structured data that
 * says what this site is (a free demo application) and is not (a business).
 *
 * The demo stays `noindex`. It is written in the voice of a fictional business
 * with invented contact details, so the only searches it could ever rank for
 * are its customers' ("dental clinic Dubai"), and a result that presented it
 * as real would mislead the person who clicked it. The owner's search ("dental
 * clinic website") belongs to the industry page on desertlaunch.dev, which
 * describes this demo and links to it; `follow` lets a crawler that does reach
 * the demo carry on to that page.
 *
 * Identical in every demo. What differs lives in `@/lib/demo-site`.
 */
export const STUDIO = {
  name: "Desert Launch",
  url: "https://www.desertlaunch.dev",
  id: "https://www.desertlaunch.dev/#organization",
  demosPage: "https://www.desertlaunch.dev/demos/",
  whatsapp: "201022838534",
} as const;

export const OG_TITLE =
  DEMO.lang === "ar"
    ? `${DEMO.headline} — عرض تجريبي من ${STUDIO.name}`
    : `${DEMO.headline} — a live demo by ${STUDIO.name}`;

/** Spread into the root layout's `metadata` after the title. */
export function demoMetadata(): Metadata {
  return {
    metadataBase: new URL(DEMO.url),
    description: DEMO.description,
    applicationName: DEMO.name,
    // Fictional business, invented contact details: never a search result.
    // Links are still followed, so the studio pages this one points at are
    // reachable from it.
    robots: { index: false, follow: true },
    // Who made the site, for anything that reads the head rather than the bar.
    authors: [{ name: STUDIO.name, url: `${STUDIO.url}/` }],
    creator: STUDIO.name,
    publisher: STUDIO.name,
    alternates: {
      types: { "text/markdown": `${DEMO.url}/llms.txt` },
    },
    openGraph: {
      type: "website",
      siteName: DEMO.name,
      url: `${DEMO.url}/`,
      title: OG_TITLE,
      description: DEMO.description,
      locale: DEMO.lang === "ar" ? "ar_SA" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: OG_TITLE,
      description: DEMO.description,
    },
    other: { "content-language": DEMO.lang },
  };
}

/** This site as a free WebApplication created by the studio, with the studio
 *  as a referenced Organization rather than a re-description.
 *
 *  Deliberately absent: any `LocalBusiness` subtype (`Dentist`, `Restaurant`,
 *  `ExerciseGym`, `RealEstateAgent`…), an address, opening hours or reviews.
 *  The business in the demo does not exist, and those types would say it
 *  does. The `@id` is the one desertlaunch.dev uses for this demo, so both
 *  sites describe one entity — keep `DEMO.audience` equal to that site's
 *  `audience` for this demo in its `app/data/demos.ts`. */
export function demoJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": STUDIO.id,
        name: STUDIO.name,
        url: `${STUDIO.url}/`,
      },
      {
        "@type": "WebApplication",
        "@id": `${DEMO.url}/#app`,
        name: DEMO.name,
        alternateName: OG_TITLE,
        url: `${DEMO.url}/`,
        description: DEMO.description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any (web browser)",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        inLanguage: DEMO.languages,
        featureList: DEMO.features,
        creator: { "@id": STUDIO.id },
        publisher: { "@id": STUDIO.id },
        // Who it is for: the owner deciding whether to have one built.
        audience: { "@type": "BusinessAudience", audienceType: DEMO.audience },
        // The indexed pages that describe this demo: the industry page that
        // sells a real build, and the page listing every demo.
        subjectOf: [
          {
            "@type": "WebPage",
            "@id": `${DEMO.industry.url}#webpage`,
            url: DEMO.industry.url,
            publisher: { "@id": STUDIO.id },
          },
          {
            "@type": "CollectionPage",
            "@id": `${STUDIO.demosPage}#webpage`,
            url: STUDIO.demosPage,
            publisher: { "@id": STUDIO.id },
          },
        ],
        // `codeRepository` belongs to SoftwareSourceCode, not to the app.
        isBasedOn: { "@type": "SoftwareSourceCode", codeRepository: DEMO.repo },
        // Says plainly what the business in the demo is: a work of fiction.
        genre: "Demo",
        abstract: DEMO.fiction,
      },
    ],
  };
}
