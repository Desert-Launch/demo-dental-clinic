import type { Metadata } from "next";

import { DEMO } from "@/lib/demo-site";

/**
 * Everything that ties this demo back to the studio that built it: the
 * metadata a share preview or a crawler reads, and the structured data that
 * says what this site is (a free demo application) and is not (a business).
 *
 * The demo stays `noindex`. It is a fictional business with invented contact
 * details, and a search result that presents it as real would mislead the
 * person who clicked it. The ranking value belongs to desertlaunch.dev, which
 * lists and describes every demo; this file makes the link between the two
 * explicit for the tools that follow it.
 */
export const STUDIO = {
  name: "Desert Launch",
  url: "https://www.desertlaunch.dev",
  id: "https://www.desertlaunch.dev/#organization",
  demosPage: "https://www.desertlaunch.dev/demos/",
  whatsapp: "201022838534",
} as const;

export const OG_TITLE = `${DEMO.name} — a working demo by ${STUDIO.name}`;

/** Spread into the root layout's `metadata` after the title. */
export function demoMetadata(): Metadata {
  return {
    metadataBase: new URL(DEMO.url),
    description: DEMO.description,
    applicationName: DEMO.name,
    // Fictional business, invented contact details: never a search result.
    robots: { index: false, follow: false },
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

/** One JSON-LD node: this site as a free WebApplication created by the studio,
 *  with the studio as a referenced Organization rather than a re-description. */
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
        mainEntityOfPage: STUDIO.demosPage,
        codeRepository: DEMO.repo,
        // Says plainly what the business in the demo is: a work of fiction.
        genre: "Demo",
        abstract: DEMO.fiction,
      },
    ],
  };
}
