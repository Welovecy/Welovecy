import "server-only";
import type { Business, CuisineId, DestId, LL, VenueType } from "./types";
import { BUSINESSES, DESTINATIONS, PROFILES, bizDirections, getDest, listingHref } from "./data";
import { DEST_CENTRE } from "./centres";
import { km } from "./geo";

/**
 * Eat and drink: restaurants, cafes, bars and clubs from the official register, grouped by type and cuisine.
 * Type and cuisine come from scripts/geo/classify.py. Cabarets are never listed.
 */
export const VENUE_PAGES: { slug: string; title: (a: string) => string; short: string; types: VenueType[]; group: "eat" | "out" }[] = [
  { slug: "restaurants", title: (a) => `Restaurants in ${a}`, short: "Restaurants", types: ["restaurant", "taverna"], group: "eat" },
  { slug: "tavernas", title: (a) => `Tavernas in ${a}`, short: "Tavernas", types: ["taverna"], group: "eat" },
  { slug: "cafes", title: (a) => `Cafés and snack bars in ${a}`, short: "Cafés", types: ["cafe", "snack"], group: "eat" },
  { slug: "bars", title: (a) => `Bars in ${a}`, short: "Bars", types: ["bar"], group: "out" },
  { slug: "pubs", title: (a) => `Pubs in ${a}`, short: "Pubs", types: ["pub"], group: "out" },
  { slug: "clubs", title: (a) => `Clubs in ${a}`, short: "Clubs", types: ["club"], group: "out" },
  { slug: "beach-bars", title: (a) => `Beach bars in ${a}`, short: "Beach bars", types: ["beachbar"], group: "out" },
];

export const CUISINE_PAGES: { id: CuisineId; slug: string; title: (a: string) => string; short: string }[] = [
  { id: "cypriot", slug: "cypriot-meze", title: (a) => `Cypriot food and meze in ${a}`, short: "Cypriot and meze" },
  { id: "greek", slug: "greek-souvlaki", title: (a) => `Greek food and souvlaki in ${a}`, short: "Greek and souvlaki" },
  { id: "seafood", slug: "fish-seafood", title: (a) => `Fish and seafood restaurants in ${a}`, short: "Fish and seafood" },
  { id: "italian", slug: "italian-pizza", title: (a) => `Italian restaurants and pizza in ${a}`, short: "Italian and pizza" },
  { id: "asian", slug: "asian-sushi", title: (a) => `Asian restaurants and sushi in ${a}`, short: "Asian and sushi" },
  { id: "indian", slug: "indian", title: (a) => `Indian restaurants in ${a}`, short: "Indian" },
  { id: "middleeast", slug: "lebanese-middle-eastern", title: (a) => `Lebanese and Middle Eastern food in ${a}`, short: "Lebanese and Middle Eastern" },
  { id: "grill", slug: "steak-grill", title: (a) => `Steakhouses and grills in ${a}`, short: "Steak and grill" },
  { id: "burger", slug: "burgers", title: (a) => `Burgers and fast food in ${a}`, short: "Burgers" },
  { id: "mexican", slug: "mexican", title: (a) => `Mexican and Latin food in ${a}`, short: "Mexican" },
  { id: "brunch", slug: "breakfast-brunch", title: (a) => `Breakfast and brunch in ${a}`, short: "Breakfast and brunch" },
  { id: "british", slug: "british", title: (a) => `British food and full English in ${a}`, short: "British" },
  { id: "dessert", slug: "desserts", title: (a) => `Desserts and ice cream in ${a}`, short: "Desserts" },
  { id: "vegan", slug: "vegetarian-vegan", title: (a) => `Vegetarian and vegan food in ${a}`, short: "Vegetarian and vegan" },
];
export const cuisineLabel = (id: CuisineId) => CUISINE_PAGES.find((c) => c.id === id)?.short ?? id;

const MIN = 4; // fewer than this and the page isn't worth having
const VENUES = BUSINESSES.filter((b) => (b.g === "eat" || b.g === "cafe" || b.g === "night") && b.vt && b.vt !== "cabaret");

export function venuesIn(d: DestId) { return VENUES.filter((b) => b.d === d); }

export interface GoingPage { area: DestId; slug: string; title: string; short: string; kind: "type" | "cuisine"; list: Business[] }
function build(): GoingPage[] {
  const out: GoingPage[] = [];
  for (const dest of DESTINATIONS) {
    const pool = venuesIn(dest.id);
    const name = areaName(dest.id);
    for (const v of VENUE_PAGES) {
      const list = pool.filter((b) => v.types.includes(b.vt!));
      if (list.length >= MIN) out.push({ area: dest.id, slug: v.slug, title: v.title(name), short: v.short, kind: "type", list });
    }
    for (const c of CUISINE_PAGES) {
      const list = pool.filter((b) => b.cz?.includes(c.id));
      if (list.length >= MIN) out.push({ area: dest.id, slug: c.slug, title: c.title(name), short: c.short, kind: "cuisine", list });
    }
  }
  return out;
}
/** The short everyday name of an area: "Protaras", not "Protaras & Eastern Villages". */
export function areaName(d: DestId) { return (getDest(d)?.name ?? d).split(" &")[0]; }
export const GOING = build();
export const goingPages = (d: DestId) => GOING.filter((p) => p.area === d);
export const getGoing = (d: string, slug: string) => GOING.find((p) => p.area === d && p.slug === slug);
export const goingHref = (d: string, slug?: string) => `/eat-drink/${d}${slug ? `/${slug}` : ""}`;

/** Where distances can be measured from: the area centre, plus its neighbourhoods. */
export function origins(d: DestId): { id: string; label: string; ll: LL }[] {
  // an area with neighbourhoods lists those (the first is its centre); otherwise just the area centre
  const locs = (PROFILES[d]?.localities ?? []).filter((l) => l.centre && !l.nearby).map((l) => ({ id: l.slug, label: l.title, ll: l.centre }));
  return locs.length ? locs : [{ id: "centre", label: `${areaName(d)} centre`, ll: DEST_CENTRE[d] }];
}

export interface VenueRow { i: string; n: string; sub: string; href: string; dir: string; ll?: LL; approx?: boolean; d0?: number }
export function rowsFor(list: Business[], d: DestId): VenueRow[] {
  const c = DEST_CENTRE[d];
  return list.map((b) => ({
    i: b.i, n: b.n, href: listingHref(b.i), dir: bizDirections(b),
    sub: [(b.cz ?? []).slice(0, 2).map(cuisineLabel).join(", ") || b.l, b.tw].filter(Boolean).join(" · "),
    ll: b.ll, approx: !!b.pr || undefined, d0: b.ll ? Math.round(km(c, b.ll) * 100) / 100 : undefined,
  })).sort((x, y) => (x.d0 ?? 999) - (y.d0 ?? 999) || x.n.localeCompare(y.n));
}
