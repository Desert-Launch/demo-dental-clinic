import {
  getServiceById,
  getServiceBySlug,
  listServices,
  sleep,
} from "@/lib/store";
import type { Service } from "@/types";

/** Every read pauses briefly so skeletons and pending states are demoable. */
const LATENCY_MS = 120;

export async function fetchServices(): Promise<Service[]> {
  await sleep(LATENCY_MS);
  return listServices();
}

export async function fetchService(id: string): Promise<Service> {
  await sleep(LATENCY_MS);
  const service = getServiceById(id) ?? getServiceBySlug(id);
  if (!service) throw new Error("We could not find that treatment.");
  return service;
}
