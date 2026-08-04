import {
  getDentistById,
  listDentists,
  listDentistsForService,
  sleep,
} from "@/lib/store";
import type { Dentist } from "@/types";

const LATENCY_MS = 120;

export async function fetchDentists(): Promise<Dentist[]> {
  await sleep(LATENCY_MS);
  return listDentists();
}

export async function fetchDentist(id: string): Promise<Dentist> {
  await sleep(LATENCY_MS);
  const dentist = getDentistById(id);
  if (!dentist) throw new Error("We could not find that dentist.");
  return dentist;
}

/** Only the clinicians who perform a given treatment. */
export async function fetchDentistsForService(serviceId: string): Promise<Dentist[]> {
  await sleep(LATENCY_MS);
  return listDentistsForService(serviceId);
}
