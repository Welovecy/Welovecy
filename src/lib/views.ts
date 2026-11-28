import "server-only";
import type { Business, DestId, LL, Place, Poi, Spot } from "./types";
import {
  BUSINESSES, DEST_CENTRE, PLACES, POIS, bizDirections, photoFor, bizSub, isStay, listingHref, placeForPoi, placeHref, placeKind, poiDirections, poiSub, spots, townOf,
} from "./data";
import { aroundLists, essentials, nearestKey, nearestOf } from "./around";
import { directionsTo, km } from "./geo";
import { KINDS } from "./kinds";

export const nearestDest = (ll: LL): DestId => nearestKey(ll, DEST_CENTRE);

/** Restaurants, bars and the like that sit inside this hotel. */
export const insideOf = (id?: string): Business[] => (id ? BUSINESSES.filter((b) => b.in === id || b.at === id) : []);

export function aroundData(ll: LL, skip?: string) {
  const inside = new Set(insideOf(skip).map((b) => b.i));
  const pool = inside.size ? spots().filter((s) => !inside.has(s.key)) : spots();
  return {
    essentials: essentials(ll, pool, skip),
    lists: aroundLists(ll, pool, skip, 30),
    near: (k: Spot["k"], n = 4) => nearestOf(ll, pool, k, n, skip),
    dest: nearestDest(ll),
  };
}

export interface RowData { href: string; n: string; sub: string; mono: string; color?: string; dir?: string; sk?: string; k?: Spot["k"]; img?: string }

/** A small photo for a list row, when we have one. */
const rowImg = (key: string) => { const u = photoFor(key)?.u; return u && /\/\d+px-/.test(u) ? u.replace(/\/\d+px-/, "/330px-") : u; };

export function poiRow(r: Poi): RowData {
  return {
    href: listingHref(r.i), n: r.n, mono: KINDS[r.k].l, color: KINDS[r.k].c, dir: poiDirections(r), sk: r.i, k: r.k, img: rowImg(r.k === "beach" ? `beach-${r.i}` : `poi-${r.i}`),
    sub: [poiSub(r), r.tw].filter(Boolean).join(" · "),
  };
}
export function placeRow(p: Place): RowData {
  const k = placeKind(p);
  return {
    href: placeHref(p.slug), n: p.name, mono: KINDS[k].l, color: KINDS[k].c, dir: p.ll ? directionsTo(p.ll) : undefined, sk: `place-${p.slug}`, k, img: rowImg(`place-${p.slug}`),
    sub: [p.unesco ? "UNESCO World Heritage" : p.cat, p.loc].filter(Boolean).join(" · "),
  };
}

export function bizRow(b: Business, extra?: string): RowData {
  return { href: listingHref(b.i), n: b.n, mono: isStay(b) ? "H" : "E", sub: [bizSub(b), extra].filter(Boolean).join(" · "), dir: bizDirections(b), sk: b.i };
}

/** Beach and sight records for an area that don't already have their own place page. */
export function poisFor(dest: DestId | undefined, kinds: Poi["k"][]): Poi[] {
  return POIS.filter((r) => (!dest || r.d === dest) && kinds.includes(r.k) && !placeForPoi(r.i))
    .sort((a, b) => a.n.localeCompare(b.n));
}

export function placesFor(dest: DestId | undefined, kind: "beach" | "sight") {
  return PLACES.filter((p) => (!dest || p.dest === dest) && (kind === "beach" ? placeKind(p) === "beach" : placeKind(p) !== "beach"));
}

export function staysIn(dest: DestId) {
  return BUSINESSES.filter((b) => b.d === dest && isStay(b));
}

/** Located hotels in an area ranked by distance to the nearest beach. */
export function staysBySea(dest: DestId, limit?: number) {
  const beaches = spots().filter((s) => s.k === "beach");
  const out = staysIn(dest).filter((b) => b.ll).map((b) => {
    let best: Spot | null = null, bd = Infinity;
    for (const s of beaches) { const d = km(b.ll!, s.ll); if (d < bd) { bd = d; best = s; } }
    return { b, beach: best, d: bd };
  }).sort((x, y) => x.d - y.d || (parseInt(y.b.c || "0") || 0) - (parseInt(x.b.c || "0") || 0));
  return limit ? out.slice(0, limit) : out;
}

export { townOf };
