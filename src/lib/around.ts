import type { AroundKind, LL, Spot } from "./types";
import { km } from "./geo";
import { ESSENTIAL_CAP_KM, ESSENTIAL_KINDS } from "./kinds";
import { SEASONS, cyMonth, isClosed } from "./season";

/** Places shut for the season stay in the list, after the ones that are open. Only touches lists that hold one. */
const openFirst = (list: Near[]) => {
  if (!list.some((n) => SEASONS[n.s.key])) return list;
  const m = cyMonth();
  return [...list].sort((a, b) => Number(isClosed(SEASONS[a.s.key], m)) - Number(isClosed(SEASONS[b.s.key], m)));
};

export interface Near { s: Spot; d: number }

export function byDistance(center: LL, pool: Spot[], skip?: string): Near[] {
  return pool
    .filter((s) => s.key !== skip)
    .map((s) => ({ s, d: km(center, s.ll) }))
    .sort((a, b) => a.d - b.d);
}

export function nearestOf(center: LL, pool: Spot[], kind: AroundKind, n: number, skip?: string): Near[] {
  return openFirst(byDistance(center, pool.filter((s) => s.k === kind), skip)).slice(0, n);
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
  for (const k of Object.keys(out)) out[k] = openFirst(out[k]);
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
