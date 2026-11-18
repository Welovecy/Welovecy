import type { AroundKind, LL, Spot } from "./types";
import { km } from "./geo";
import { ESSENTIAL_CAP_KM, ESSENTIAL_KINDS } from "./kinds";

export interface Near { s: Spot; d: number }

export function byDistance(center: LL, pool: Spot[], skip?: string): Near[] {
  return pool
    .filter((s) => s.key !== skip)
    .map((s) => ({ s, d: km(center, s.ll) }))
    .sort((a, b) => a.d - b.d);
}

export function nearestOf(center: LL, pool: Spot[], kind: AroundKind, n: number, skip?: string): Near[] {
  return byDistance(center, pool.filter((s) => s.k === kind), skip).slice(0, n);
}

export interface Essential { kind: AroundKind; near: Near | null }

/** Nearest pharmacy, clinic, supermarket and beach, or null when nothing is mapped within the cap. */
export function essentials(center: LL, pool: Spot[], skip?: string): Essential[] {
  return ESSENTIAL_KINDS.map((kind) => {
    const n = nearestOf(center, pool, kind, 1, skip)[0];
    return { kind, near: n && n.d <= ESSENTIAL_CAP_KM ? n : null };
  });
}

/** Slim per-kind lists for a client "what's around" view. */
export function aroundLists(center: LL, pool: Spot[], skip: string | undefined, perKind = 40): Record<string, Near[]> {
  const all = byDistance(center, pool, skip);
  const out: Record<string, Near[]> = {};
  for (const n of all) {
    const list = (out[n.s.k] ||= []);
    if (list.length < perKind) list.push(n);
  }
  return out;
}

export function nearestKey<T extends string>(center: LL, centres: Record<T, LL>): T {
  let best = Object.keys(centres)[0] as T, bd = Infinity;
  for (const k of Object.keys(centres) as T[]) {
    const d = km(center, centres[k]);
    if (d < bd) { bd = d; best = k; }
  }
  return best;
}
