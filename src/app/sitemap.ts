import { AIRPORTS, POPULAR, slugOf } from "@/lib/distances";
import { MONTH_SLUGS } from "@/lib/months";
import { GUIDES, guideHref } from "@/lib/guides";
import { BEACH_HOTELS, hotelsNearHref } from "@/lib/hotelsNear";
import { DISTRICTS, dutyHref } from "@/lib/duty";
import { GOING, goingHref } from "@/lib/going";
import type { MetadataRoute } from "next";
import { BUSINESSES, DESTINATIONS, INTERESTS, PLACES, POIS, PROFILES, isStay, listingHref, placeForPoi, placeHref } from "@/lib/data";
import { absolute, DATA_REVIEWED } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(DATA_REVIEWED + "T00:00:00Z");
  const paths = [
    "/", "/explore", "/explore/events", "/explore/festivals", "/destinations", "/must-see", "/beaches", "/stay", "/around", "/essentials", "/practical", "/buses", "/unesco", "/wine", "/weather", "/quiz", "/guides", "/distances", "/hotels-near", "/pharmacies-on-duty", "/eat-drink",
    ...[...new Set(GOING.map((g) => g.area))].map((a) => goingHref(a)),
    ...GOING.map((g) => goingHref(g.area, g.slug)),
    ...DISTRICTS.map((d) => dutyHref(d.id)),
    ...BEACH_HOTELS.map((b) => hotelsNearHref(b.slug)),
    ...AIRPORTS.flatMap((a) => POPULAR.map((id) => `/distances/${a.slug}-to-${slugOf(id)}`)),
    ...MONTH_SLUGS.map((m) => `/weather/${m}`),
    ...GUIDES.map((g) => guideHref(g.slug)), "/things", "/stories", "/about", "/privacy",
    ...DESTINATIONS.flatMap((d) => [`/destinations/${d.id}`, `/stay/${d.id}`]),
    ...Object.entries(PROFILES).flatMap(([d, p]) => p.localities.map((l) => `/destinations/${d}/${l.slug}`)),
    ...PLACES.map((p) => placeHref(p.slug)),
    ...INTERESTS.map((i) => `/things/${i.id}`),
    ...BUSINESSES.filter(isStay).map((b) => listingHref(b.i)),
    ...POIS.filter((r) => r.k === "beach" && !placeForPoi(r.i)).map((r) => listingHref(r.i)),
    // Attractions (museums, walks, dive centres, tourist offices, family days out) and every licensed venue.
    ...POIS.filter((r) => ["sight", "family", "activity", "nature", "info"].includes(r.k) && !placeForPoi(r.i)).map((r) => listingHref(r.i)),
    ...BUSINESSES.filter((b) => !isStay(b)).map((b) => listingHref(b.i)),
  ];
  return paths.map((p) => ({ url: absolute(p), lastModified }));
}
