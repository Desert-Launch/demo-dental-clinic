/**
 * The in-memory store — the demo's single source of truth.
 *
 * Features reach it only through their own `api.ts`; components never import
 * from here directly. State lives for the browser session and re-seeds on a
 * hard refresh, which is what "Reset demo data" does on demand.
 */
export * from "@/lib/store/db";
export { appointmentEnd, seedDentists, seedServices } from "@/lib/store/seed";
export { createId, createReference } from "@/lib/store/ids";
