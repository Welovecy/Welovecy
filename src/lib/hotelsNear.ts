import "server-only";
import type { Business, DestId, Poi } from "./types";
import { BUSINESSES, POIS, getPlace, isStay, listingHref, placeForPoi, placeHref } from "./data";
import { km } from "./geo";

/** Hotels count as "near" a beach within this straight-line distance, and "on the beach" within the shorter one. */
export const NEAR_KM = 1.5;
export const WALK_KM = 0.5;
const MIN_HOTELS = 4;

export interface BeachHotels {
  slug: string;
  name: string;
  poi: Poi;
  /** our own page for the beach: a place page or the official listing */
  href: string;
  photo?: string;
  d: DestId;
  town: string;
  hotels: { b: Business; d: number }[];
}

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function build(): BeachHotels[] {
  const stays = BUSINESSES.filter((b) => isStay(b) && b.ll);
  const out: BeachHotels[] = [];
  for (const r of POIS) {
    if (r.k !== "beach" || !r.ll) continue;
    const place = placeForPoi(r.i) ? getPlace(placeForPoi(r.i)!) : undefined;
    const hotels = stays.map((b) => ({ b, d: km(b.ll!, r.ll!) })).filter((x) => x.d <= NEAR_KM)
      .sort((x, y) => x.d - y.d || x.b.n.localeCompare(y.b.n));
    // Beaches people search for by name: Blue Flag beaches, the ones with our own page, and busy hotel strips.
    if (hotels.length < (r.bf || place ? MIN_HOTELS : 8)) continue;
    const name = place?.name ?? r.n;
    out.push({
      slug: slugify(name), name, poi: r, d: r.d, town: r.tw && r.tw !== "Not specified" ? r.tw : "",
      href: place ? placeHref(place.slug) : listingHref(r.i), photo: place ? `place-${place.slug}` : `beach-${r.i}`, hotels,
    });
  }
  // Two beaches can share a name in different towns: keep both, told apart by town.
  const seen = new Map<string, number>();
  for (const b of out) seen.set(b.slug, (seen.get(b.slug) ?? 0) + 1);
  for (const b of out) if (seen.get(b.slug)! > 1) b.slug = `${b.slug}-${slugify(b.town || b.d)}`;
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export const BEACH_HOTELS = build();
const bySlug = new Map(BEACH_HOTELS.map((b) => [b.slug, b]));
const byPoi = new Map(BEACH_HOTELS.map((b) => [b.poi.i, b]));
export const getBeachHotels = (slug: string) => bySlug.get(slug);
/** The "Hotels near" page for a beach record, if it has one. */
export const hotelsNearFor = (poiId: string | undefined) => (poiId ? byPoi.get(poiId) : undefined);
export const hotelsNearHref = (slug: string) => `/hotels-near/${slug}`;

/** Other beach pages close by, nearest first. */
export function nearbyBeachPages(b: BeachHotels, n = 6) {
  return BEACH_HOTELS.filter((x) => x !== b).map((x) => ({ x, d: km(x.poi.ll!, b.poi.ll!) }))
    .filter((o) => o.d < 8).sort((p, q) => p.d - q.d).slice(0, n);
}
