import "server-only";
import content from "@data/content.json";
import businessesJson from "@data/businesses.json";
import poisJson from "@data/pois.json";
import imagesJson from "@data/images.json";
import busJson from "@data/bus.json";
import guideJson from "@data/guide.json";
import profilesJson from "@data/profiles.json";
import type {
  BusData, BusRoute, Business, Destination, DestId, Experience, Interest, LL, Maker, Photo, Place, Poi, Profile, Spot, WineRoute,
} from "./types";
import { stars } from "./text";
import { directionsTo, km, searchMaps } from "./geo";

type RawPlace = Omit<Place, "slug" | "ll">;
const raw = content as unknown as {
  DEST: Destination[];
  PLACES: Record<string, RawPlace>;
  EXPERIENCES: Record<string, Omit<Experience, "slug">>;
  BUSINESSES: Record<string, Omit<Maker, "slug">>;
  PLL: Record<string, LL>;
  INTERESTS: Interest[];
};

export const DESTINATIONS: Destination[] = raw.DEST;
export const INTERESTS: Interest[] = raw.INTERESTS;
type GuidePlace = Omit<Place, "why" | "features" | "practical" | "nearby">;
const guide = guideJson as unknown as {
  places: GuidePlace[]; enrich: Record<string, Partial<Place>>; wineRoutes: WineRoute[]; source: { t: string; date: string };
};
/** Hand-written places, enriched with the visitor guide, then the guide's own new places. */
export const PLACES: Place[] = [
  ...Object.entries(raw.PLACES).map(([slug, p]) => ({ ...p, slug, ll: raw.PLL[slug], ...(guide.enrich[slug] ?? {}) } as Place)),
  ...guide.places.map((g) => ({
    ...g, why: "", features: [],
    practical: [["Location", g.loc ?? "", false], ["Opening hours", "Check before you go.", true]] as Place["practical"],
  } as Place)),
];
export const WINE_ROUTES = guide.wineRoutes;
export const GUIDE_SOURCE = guide.source;
export const PROFILES = (profilesJson as unknown as { profiles: Record<string, Profile> }).profiles;
export const getProfile = (dest: string) => PROFILES[dest];
export const getLocality = (dest: string, slug: string) => PROFILES[dest]?.localities.find((l) => l.slug === slug);
export const EXPERIENCES: Experience[] = Object.entries(raw.EXPERIENCES).map(([slug, e]) => ({ ...e, slug }));
export const MAKERS: Maker[] = Object.entries(raw.BUSINESSES).map(([slug, b]) => ({ ...b, slug }));
export const BUSINESSES = businessesJson as unknown as Business[];
export const POIS = poisJson as unknown as Poi[];
export const IMAGES = imagesJson as unknown as Record<string, Photo>;
export const BUS = busJson as unknown as BusData;
const busStopBy = new Map(BUS.stops.map((s) => [s.i, s]));
export const getBusStop = (id: string) => busStopBy.get(id);
export const busRoutesAt = (keys: string[]): BusRoute[] =>
  keys.map((k) => BUS.routes[k]).filter(Boolean).sort((a, b) => a.r.localeCompare(b.r, "en", { numeric: true }));
export const busStopHref = (id: string) => `/buses/stop/${id}`;
const routeList = (keys: string[]) => [...new Set(busRoutesAt(keys).map((r) => r.r))];

/** Our hand-written beach pages absorb the matching official beach record (within 350 m). */
export const PLACE_BEACH = new Map<string, Poi>();
const POI_PLACE = new Map<string, string>();
for (const p of PLACES) {
  if (!p.ll || p.cat !== "Beach") continue;
  let best: Poi | undefined, bd = 0.35;
  for (const r of POIS) {
    if (r.k !== "beach" || !r.ll) continue;
    const d = km(p.ll, r.ll);
    if (d < bd) { bd = d; best = r; }
  }
  if (best) { PLACE_BEACH.set(p.slug, best); POI_PLACE.set(best.i, p.slug); }
}
for (const r of POIS) {
  if ((r.k !== "sight" && r.k !== "family") || !r.ll || POI_PLACE.has(r.i)) continue;
  const p = PLACES.find((x) => x.ll && placeKind(x) !== "beach" && km(x.ll, r.ll!) < 0.12);
  if (p) POI_PLACE.set(r.i, p.slug);
}
/** The place page that stands in for this record, if any. */
export const placeForPoi = (id: string) => POI_PLACE.get(id);

const destBy = new Map(DESTINATIONS.map((d) => [d.id, d]));
const placeBy = new Map(PLACES.map((p) => [p.slug, p]));
const bizBy = new Map(BUSINESSES.map((b) => [b.i, b]));
const poiBy = new Map(POIS.map((p) => [p.i, p]));

export const getDest = (id: string) => destBy.get(id as DestId);
export const getPlace = (slug: string) => placeBy.get(slug);
export const getBusiness = (id: string) => bizBy.get(id);
export const getPoi = (id: string) => poiBy.get(id);
export const getExperience = (slug: string) => EXPERIENCES.find((e) => e.slug === slug);
export const getMaker = (slug: string) => MAKERS.find((m) => m.slug === slug);
export const getInterest = (id: string) => INTERESTS.find((i) => i.id === id);

export { DEST_CENTRE } from "./centres";
import { DEST_CENTRE } from "./centres";

export const isStay = (b: Business) => b.g === "hotel" || b.g === "apart";
export const townOf = (tw: string | undefined, d: DestId) =>
  !tw || tw === "Not specified" ? getDest(d)?.name ?? "" : tw;

export function placeKind(p: Place): "beach" | "family" | "sight" {
  if (p.cat === "Beach") return "beach";
  if (p.cat === "Waterpark") return "family";
  return "sight";
}

export function poiSub(r: Poi): string {
  if (r.k === "beach") {
    const b: string[] = [];
    if (r.bf) b.push("Blue Flag");
    if (r.sf) b.push(r.sf);
    return b.length ? b.join(" · ") : "Beach";
  }
  if (r.k === "health") return r.ft || "Medical";
  if (r.k === "market") return r.ch || "Supermarket";
  if (r.k === "pharmacy") return "Pharmacy";
  if (r.k === "family") return "Family day out";
  return "Sight";
}

export function bizSub(b: Business): string {
  return [b.l, stars(b.c), townOf(b.tw, b.d)].filter(Boolean).join(" · ");
}

export function poiDirections(r: Poi): string {
  if (r.ll && r.pr !== "approx") return directionsTo(r.ll);
  return searchMaps(`${r.a || r.n}, ${r.tw || ""}, Cyprus`);
}
export function bizDirections(b: Business): string {
  if (b.ll && !b.pr) return directionsTo(b.ll);
  return searchMaps(`${b.n}, ${b.a || ""}, ${townOf(b.tw, b.d)}, Cyprus`);
}

export const listingHref = (id: string) => `/listing/${encodeURIComponent(id)}`;
export const placeHref = (slug: string) => `/places/${slug}`;

/** Every mapped point, ready for distance work. */
let spotsCache: Spot[] | null = null;
export function spots(): Spot[] {
  if (spotsCache) return spotsCache;
  const out: Spot[] = [];
  for (const p of PLACES) {
    if (!p.ll) continue;
    out.push({ key: `place-${p.slug}`, n: p.name, k: placeKind(p), ll: p.ll, href: placeHref(p.slug), sub: p.cat });
  }
  for (const r of POIS) {
    if (!r.ll || POI_PLACE.has(r.i)) continue;
    out.push({
      key: r.i, n: r.n, k: r.k, ll: r.ll, href: listingHref(r.i), sub: poiSub(r),
      approx: r.pr === "approx" || undefined, dir: poiDirections(r),
    });
  }
  for (const b of BUSINESSES) {
    if (!b.ll) continue;
    const k = isStay(b) ? "stay" : b.g === "night" ? "night" : "eat";
    if (b.vt === "cabaret" || b.pr === "area") continue;
    out.push({ key: b.i, n: b.n, k, ll: b.ll, href: listingHref(b.i), sub: [b.l, stars(b.c)].filter(Boolean).join(" · "), approx: b.pr === "approx" || undefined, dir: bizDirections(b) });
  }
  for (const s of BUS.stops) {
    const rt = routeList(s.rk);
    out.push({ key: s.i, n: s.n, k: "bus", ll: s.ll, href: busStopHref(s.i), sub: `Routes ${rt.join(", ")}`, rt });
  }
  spotsCache = out;
  return out;
}

export function photoFor(key: string): Photo | undefined {
  if (key === "home-hero" || key === "place-aphrodite-rock") {
    return { u: "/img/aphrodite-rock.jpg", a: "", l: "", t: "Aphrodite's Rock at sunset" };
  }
  return IMAGES[key];
}

export const PLACES_BY_DEST = (id: DestId) => PLACES.filter((p) => p.dest === id);
