import { countRecords, resetDatabase, sleep } from "@/lib/store";

/**
 * Re-seeds the in-memory store. The only "destructive" action in the demo, and
 * it exists so a session can be handed to the next prospect clean.
 */
export async function resetDemoData() {
  await sleep(320);
  resetDatabase();
  return countRecords();
}
