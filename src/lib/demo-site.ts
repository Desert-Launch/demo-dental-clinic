/**
 * What this demo is, in one place. The Desert Launch bar, the share-preview
 * card, the metadata and the structured data all read from here, so they can
 * never disagree about the name, the URL or the language.
 */
export type DemoLang = "en" | "ar";

export const DEMO = {
  /** Short id the landing site uses; also the subdomain and utm_campaign. */
  slug: "dental",
  name: "Demo Dental Clinic",
  /** Latin-only name for the share-preview image, whose default font has no Arabic. */
  latinName: "Demo Dental Clinic",
  url: "https://dental.demos.desertlaunch.dev",
  /** Language of the bar and the metadata. Typed as the union so the shared
   *  code that handles both languages stays identical in every demo. */
  lang: "en" as DemoLang,
  /** Interface languages the demo itself offers. */
  languages: ["en"],
  kind: "dental clinic",
  city: "Dubai",
  /** One paragraph for share previews and search snippets. */
  description:
    "A working demo of a dental clinic website with its front-desk dashboard, by Desert Launch: treatments and prices, online booking with real slot rules, appointments and patient records. Fictional clinic, sample data.",
  /** Plain statement that the business is invented. */
  fiction:
    "A fictional business: the names, prices, address and phone numbers are invented, and the data is sample data that resets on refresh.",
  features: [
      "Treatments and prices",
      "Online booking with real slot rules (lunch break, closed day, nothing inside two hours)",
      "Reschedule, change status or cancel",
      "Front-desk diary and appointment list",
      "Patient records with notes",
      "Optimistic updates with a deliberate ~10% cancellation failure to show rollback"
  ],
  repo: "https://github.com/Desert-Launch/demo-dental-clinic",
} as const;
