import { DEMO } from "@/lib/demo-site";
import { STUDIO } from "@/lib/desert-launch";

/**
 * /llms.txt — this demo described for language models and answer engines.
 *
 * Generated from `@/lib/demo-site` at build time instead of kept as a static
 * file. The static copies drifted: after the businesses were renamed to
 * "Demo …", every llms.txt still introduced the old, plausible-sounding names,
 * which is exactly the thing a model would repeat as if it were a real
 * business. One source means the name here is always the name on the site.
 *
 * Identical in every demo.
 */
export const dynamic = "force-static";

const LANGUAGE_NAMES: Record<string, string> = { en: "English", ar: "Arabic" };

export function GET() {
  const languages = DEMO.languages.map((l) => LANGUAGE_NAMES[l] ?? l).join(" and ");
  const lines = [
    `# ${DEMO.name} — a working demo by ${STUDIO.name}`,
    "",
    `> ${DEMO.description}`,
    "",
    DEMO.fiction,
    "",
    `${DEMO.name} is a live demo published by ${STUDIO.name} (${STUDIO.url}/), a software development company in Cairo, Egypt that builds mobile apps, web platforms, MVPs and internal business systems for clients in Egypt, the Gulf, Europe and the US. It shows a ${DEMO.kind} website together with the staff dashboard behind it, so the owner of that kind of business can try the customer's side and then watch the result arrive on the staff side.`,
    "",
    "## Who it is for",
    "",
    `${DEMO.audience} deciding whether to have a system like this built. Not the customers of the business shown: the business is fictional.`,
    "",
    `What ${STUDIO.name} builds for them, how long it takes, what a real build adds and the questions owners ask: ${DEMO.industry.url}`,
    "",
    "## What this demo is",
    "",
    `- Kind of business portrayed: ${DEMO.kind}, set in ${DEMO.city}. The business, its people, prices, address and phone numbers are invented.`,
    `- Interface language${DEMO.languages.length > 1 ? "s" : ""}: ${languages}.`,
    "- Everything runs in the browser against an in-memory store. There is no backend, no database, no accounts and no payments; nothing entered is sent anywhere, and a refresh resets the data.",
    `- The demo is excluded from search engines (noindex) because it is not a real business. Its indexed description is the industry page above.`,
    "",
    "## What works",
    "",
    ...DEMO.features.map((f) => `- ${f}`),
    "",
    "## Where to look",
    "",
    ...DEMO.pages.map((p) => `- ${p.path} — ${p.label}`),
    "",
    "## Getting one like this",
    "",
    `A real build starts from the same screens and flows and adds a database, staff accounts, payments and notifications where they are needed, with the business's own services, prices, hours, languages and brand, on hosting in its own name. ${STUDIO.name} quotes a fixed price in USD in writing after a free scope call. WhatsApp: +20 102 283 8534. Email: abdullah@desertlaunch.dev.`,
    "",
    `- ${DEMO.industry.name}: ${DEMO.industry.url}`,
    `- All demos: ${STUDIO.demosPage}`,
    `- Studio: ${STUDIO.url}/`,
    `- Studio llms.txt: ${STUDIO.url}/llms.txt`,
    `- Source code: ${DEMO.repo}`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
