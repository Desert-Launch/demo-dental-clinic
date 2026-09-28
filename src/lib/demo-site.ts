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
  /** What the demo is, in the words its buyer searches with. The share-preview
   *  title and the heading of llms.txt. In the demo's own language. */
  headline: "Dental clinic website with online booking",
  /** Who the demo is for: the owner of this kind of business, not the
   *  business's customers. Emitted as `audience` in the JSON-LD. */
  audience: "Dental clinics and dental practices",
  /** The Desert Launch page that owns this vertical in search and explains
   *  what a real build adds. The bar's brand link and the JSON-LD point here,
   *  so the demo hands its visitors and its context to one indexed page. */
  industry: {
    url: "https://www.desertlaunch.dev/industries/clinics/",
    name: "Clinic and dental websites by Desert Launch",
  },
  /** The bar's call to action, in the demo's language. */
  cta: "Want this for your clinic?",
  /** Routes worth opening, listed in llms.txt. */
  pages: [
    { path: "/", label: "home with the next available slot" },
    { path: "/services", label: "treatments and prices" },
    { path: "/book", label: "the booking flow" },
    { path: "/admin", label: "clinic dashboard" },
    { path: "/admin/appointments", label: "search, filter, reschedule, cancel" },
    { path: "/admin/patients", label: "patient records" },
  ],
} as const;
