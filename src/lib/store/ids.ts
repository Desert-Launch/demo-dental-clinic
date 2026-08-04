/**
 * `crypto.randomUUID()` only exists in a secure context, and this demo is often
 * shown from a laptop over a LAN address. Fall back rather than crash.
 */
export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

/** Characters a receptionist can read down a phone line without ambiguity. */
const REFERENCE_ALPHABET = "ACDEFGHJKLMNPQRTUVWXY34679";

export function createReference(): string {
  let code = "";
  for (let index = 0; index < 5; index += 1) {
    code += REFERENCE_ALPHABET[Math.floor(Math.random() * REFERENCE_ALPHABET.length)];
  }
  return `ND-${code}`;
}

/**
 * Small deterministic PRNG so seed data looks hand-made but never shuffles
 * between renders within a session.
 */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
