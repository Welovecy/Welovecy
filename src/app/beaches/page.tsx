import type { Metadata } from "next";
import Link from "next/link";
import { DESTINATIONS, POIS, getDest, getPlace, listingHref, photoFor, placeForPoi, placeHref, poiDirections } from "@/lib/data";
import { DEST_CENTRE } from "@/lib/centres";
import { CLIMATE, CLIMATE_SOURCE } from "@/lib/weather";
import { Crumbs } from "@/components/Bits";
import { BeachExplorer, type Beach, type AreaInfo } from "@/components/BeachExplorer";
import type { DestId } from "@/lib/types";

export const metadata: Metadata = { title: "Beaches", description: "Every public beach in the Republic of Cyprus, with Blue Flag status, lifeguards and facilities from official sources. Find the closest to you." };

const SHORT: Record<string, string> = { ayianapa: "Ayia Napa", protaras: "Protaras", larnaca: "Larnaca", limassol: "Limassol", paphos: "Paphos", akamas: "Akamas and Latchi" };

/** Photos for the cards: the place page's photo if the beach has one, else the beach's own. */
function imgFor(i: string, slug?: string) {
  const ph = (slug && photoFor(`place-${slug}`)) || photoFor(`beach-${i}`);
  if (!ph) return undefined;
  return { u: ph.u.includes("/1280px-") ? ph.u.replace("/1280px-", "/640px-") : ph.u, t: ph.t };
}

export default function Beaches() {
  const list = POIS.filter((r) => r.k === "beach" && r.ll);
  const beaches: Beach[] = list.map((r) => {
    const slug = placeForPoi(r.i);
    const p = slug ? getPlace(slug) : undefined;
    const f = r.fac ?? [];
    const im = imgFor(r.i, p?.slug);
    return {
      href: p ? placeHref(p.slug) : listingHref(r.i), n: p ? p.name : r.n, town: r.tw || getDest(r.d)?.name || "", area: r.d, ll: r.ll!,
      img: im?.u, alt: im?.t, dir: poiDirections(r),
      bf: !!r.bf, lg: f.includes("Lifeguards"), sand: /sand/i.test(r.sf || ""), pebble: /pebble/i.test(r.sf || "") && !/sand/i.test(r.sf || ""),
      play: f.includes("Playground"), beds: f.includes("Sunbeds and umbrellas"), food: f.includes("Food and drinks"), wheel: f.includes("Wheelchair accessible"),
    };
  }).sort((a, b) => Number(!!b.img) - Number(!!a.img) || Number(b.bf) - Number(a.bf) || a.n.localeCompare(b.n));
  const areas: AreaInfo[] = DESTINATIONS.filter((d) => beaches.some((b) => b.area === d.id) && d.id !== "nicosia")
    .map((d) => ({ id: d.id, name: SHORT[d.id] ?? d.name, centre: DEST_CENTRE[d.id as DestId], sea: CLIMATE[d.id as DestId]?.sea ?? null }));
  const month = Number(new Date().toLocaleDateString("en-GB", { month: "numeric", timeZone: "Asia/Nicosia" })) - 1;
  return (
    <>
      <section className="wrap bx-head">
        <Crumbs items={[["Home", "/"], ["Beaches"]]} />
        <h1 className="bx-title">Find your beach.</h1>
        <p className="bx-lead">{beaches.length} beaches across the Republic of Cyprus. Tap the map, pick what matters, and see the closest first.</p>
      </section>
      <section className="wrap bx-wrap">
        <BeachExplorer beaches={beaches} areas={areas} month={month} />
        <p className="tag" style={{ marginTop: 20 }}>
          Facilities and Blue Flag status (2026) from official sources; they can change by season. Live weather from MET Norway. Sea temperature is the monthly average from the{" "}
          <a href={CLIMATE_SOURCE.u} target="_blank" rel="noopener">{CLIMATE_SOURCE.t}</a>. Times and distances are estimates. Map © OpenStreetMap contributors. <Link href="/hotels-near">Hotels near the beach</Link>
        </p>
      </section>
    </>
  );
}
