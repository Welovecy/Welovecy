import type { MetadataRoute } from "next";
import { BUSINESSES, DESTINATIONS, INTERESTS, PLACES, POIS, PROFILES, isStay, listingHref, placeForPoi, placeHref } from "@/lib/data";
import { absolute, DATA_REVIEWED } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(DATA_REVIEWED + "T00:00:00Z");
  const paths = [
    "/", "/destinations", "/must-see", "/beaches", "/stay", "/around", "/essentials", "/practical", "/buses", "/unesco", "/wine", "/weather", "/quiz", "/things", "/stories", "/about",
    ...DESTINATIONS.flatMap((d) => [`/destinations/${d.id}`, `/stay/${d.id}`]),
    ...Object.entries(PROFILES).flatMap(([d, p]) => p.localities.map((l) => `/destinations/${d}/${l.slug}`)),
    ...PLACES.map((p) => placeHref(p.slug)),
    ...INTERESTS.map((i) => `/things/${i.id}`),
    ...BUSINESSES.filter(isStay).map((b) => listingHref(b.i)),
    ...POIS.filter((r) => r.k === "beach" && !placeForPoi(r.i)).map((r) => listingHref(r.i)),
  ];
  return paths.map((p) => ({ url: absolute(p), lastModified }));
}
