import type { Metadata } from "next";
import Link from "next/link";
import { DESTINATIONS, PLACE_BEACH, POIS, getDest, getPlace, listingHref, photoFor, placeForPoi, placeHref, poiDirections, poiSub } from "@/lib/data";
import { Photo } from "@/components/Photo";
import { PageHead } from "@/components/Bits";
import { PlaceCard } from "@/components/Cards";
import { BeachBrowser, type BeachItem } from "@/components/BeachBrowser";
import { KINDS } from "@/lib/kinds";

export const metadata: Metadata = { title: "Beaches", description: "Every public beach in the Republic of Cyprus, with Blue Flag status, lifeguards and facilities from official sources." };

export default function Beaches() {
  const beaches = POIS.filter((r) => r.k === "beach");
  const items: BeachItem[] = beaches.map((r) => {
    const place = placeForPoi(r.i);
    const p = place ? getPlace(place) : undefined;
    return {
      href: p ? placeHref(p.slug) : listingHref(r.i), n: p ? p.name : r.n,
      sub: [poiSub(r), r.tw || getDest(r.d)?.name].filter(Boolean).join(" · "), dir: poiDirections(r), area: r.d,
      bf: !!r.bf, lg: !!r.fac?.includes("Lifeguards"), sand: /sand/i.test(r.sf || ""), play: !!r.fac?.includes("Playground"), color: KINDS.beach.c,
    };
  }).sort((a, b) => a.n.localeCompare(b.n));
  const featured = [...PLACE_BEACH.keys()].map((s) => getPlace(s)!).filter(Boolean);
  const pictured = beaches.filter((r) => !placeForPoi(r.i) && photoFor(`beach-${r.i}`));
  const areas = DESTINATIONS.filter((d) => items.some((i) => i.area === d.id)).map((d) => [d.id, d.name] as [string, string]);
  return (
    <>
      <PageHead title="Beaches" lead={`${beaches.length} beaches across the Republic of Cyprus, with facilities and Blue Flag status from official sources.`} crumbs={[["Home", "/"], ["Beaches"]]} />
      {featured.length ? (
        <section className="wrap" aria-labelledby="h-fav" style={{ paddingTop: 16 }}>
          <div className="sec-head"><h2 id="h-fav">Our favourites</h2></div>
          <div className="grid">{featured.map((p) => <PlaceCard key={p.slug} p={p} />)}</div>
        </section>
      ) : null}
      {pictured.length ? (
        <section className="wrap" aria-labelledby="h-pics">
          <div className="sec-head"><h2 id="h-pics">More beaches we love</h2></div>
          <div className="grid">
            {pictured.map((r) => (
              <div className="card" key={r.i}>
                <Link href={listingHref(r.i)} className="card-link">
                  <Photo photo={photoFor(`beach-${r.i}`)} label={r.n} tint="#2E6E8E" ratio="4/3" />
                  <div><p className="eyebrow">{r.tw || getDest(r.d)?.name}</p><h3 className="mt4">{r.n}</h3><p className="mt6">{poiSub(r)}{r.bf ? " · Blue Flag" : ""}</p></div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      <section className="wrap" aria-labelledby="h-all">
        <div className="sec-head"><h2 id="h-all">Every beach</h2></div>
        <BeachBrowser items={items} areas={areas} />
        <p className="tag" style={{ marginTop: 16 }}>Facilities can change by season. Blue Flag status is for 2026.</p>
      </section>
    </>
  );
}
