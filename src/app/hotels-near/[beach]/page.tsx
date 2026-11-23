import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { bizDirections, bizSub, getDest, listingHref, photoFor, poiSub } from "@/lib/data";
import { BEACH_HOTELS, NEAR_KM, WALK_KM, getBeachHotels, hotelsNearHref, nearbyBeachPages } from "@/lib/hotelsNear";
import { fmtD, walkMinutes } from "@/lib/geo";
import { Crumbs } from "@/components/Bits";
import { ListRow } from "@/components/ListRow";
import { Photo } from "@/components/Photo";
import { AirportLine } from "@/components/AirportLine";
import { JsonLd } from "@/components/JsonLd";
import { absolute } from "@/lib/site";

type P = { params: Promise<{ beach: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return BEACH_HOTELS.map((b) => ({ beach: b.slug })); }

const where = (b: { town: string; d: string }) => b.town || getDest(b.d)?.name || "";

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const b = getBeachHotels((await params).beach);
  if (!b) return {};
  const close = b.hotels.filter((h) => h.d <= WALK_KM).length;
  return {
    title: `Hotels near ${b.name}`,
    description: `${b.hotels.length} licensed hotels and apartments within ${NEAR_KM} km of ${b.name}${where(b) ? `, ${where(b)}` : ""}${close ? `, ${close} of them a short walk from the sand` : ""}. Closest first, with walking times.`,
    alternates: { canonical: hotelsNearHref(b.slug) },
  };
}

function walk(d: number) {
  const m = walkMinutes(d);
  return `${fmtD(d)} · ${m} min walk`;
}

export default async function HotelsNear({ params }: P) {
  const b = getBeachHotels((await params).beach);
  if (!b) notFound();
  const close = b.hotels.filter((h) => h.d <= WALK_KM);
  const further = b.hotels.filter((h) => h.d > WALK_KM);
  const dest = getDest(b.d);
  const photo = b.photo ? photoFor(b.photo) : undefined;
  const others = nearbyBeachPages(b);
  const facts = [poiSub(b.poi), ...(b.poi.fac ?? []).slice(0, 4)].filter(Boolean);
  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Hotels near ${b.name}`,
    itemListElement: b.hotels.slice(0, 30).map((h, i) => ({
      "@type": "ListItem", position: i + 1,
      item: { "@type": "LodgingBusiness", name: h.b.n, url: absolute(listingHref(h.b.i)), ...(h.b.ll ? { geo: { "@type": "GeoCoordinates", latitude: h.b.ll[0], longitude: h.b.ll[1] } } : {}) },
    })),
  };
  return (
    <>
      <JsonLd data={ld} />
      <div className="wrap">
        <Crumbs items={[["Home", "/"], ["Where to stay", "/stay"], ["Hotels near the beach", "/hotels-near"], [b.name]]} />
        <div className="around-head">
          <p className="eyebrow">{where(b)}</p>
          <h1>Hotels near {b.name}</h1>
          <p className="lead">
            {close.length ? <><strong>{close.length}</strong> licensed {close.length === 1 ? "place" : "places"} to stay within {`${WALK_KM * 1000}\u00a0m`} of the sand, and </> : null}
            <strong>{b.hotels.length}</strong> within {NEAR_KM} km. Closest first.
          </p>
          <div className="actions">
            <Link className="btn btn-primary" href={b.href}>About {b.name}</Link>
            {dest ? <Link className="btn btn-ghost" href={`/stay/${dest.id}`}>All of {dest.name}</Link> : null}
          </div>
        </div>
      </div>
      {photo ? <div className="wrap"><Photo photo={photo} label={b.name} tint="#2E6E8E" ratio="21/9" priority hero className="g-photo" /></div> : null}
      <section className="wrap" style={{ paddingTop: 24 }}>
        {facts.length ? <p className="tag" style={{ marginBottom: 20 }}>{facts.join(" · ")}</p> : null}
        <div className="near-group" style={{ maxWidth: 760 }}>
          {close.length ? (
            <>
              <h2 style={{ fontSize: 26 }}>A short walk to the beach</h2>
              <ul className="rows">{close.map((h) => <ListRow key={h.b.i} href={listingHref(h.b.i)} n={h.b.n} mono="H" sub={`${walk(h.d)} · ${bizSub(h.b)}`} dir={bizDirections(h.b)} save />)}</ul>
            </>
          ) : null}
          {further.length ? (
            <>
              <h2 style={{ fontSize: 26, marginTop: close.length ? 28 : 0 }}>{close.length ? "A little further" : "Within reach of the beach"}</h2>
              <ul className="rows">{further.map((h) => <ListRow key={h.b.i} href={listingHref(h.b.i)} n={h.b.n} mono="H" sub={`${h.d <= 1.2 ? walk(h.d) : fmtD(h.d)} · ${bizSub(h.b)}`} dir={bizDirections(h.b)} save />)}</ul>
            </>
          ) : null}
          <p className="tag" style={{ marginTop: 20 }}>
            Every hotel and apartment here is on the official tourism register. Distances are measured from the beach in a straight line, and walking times allow for the streets. Before you book, check the route on the map: a main road or a hill can make a short walk feel longer.
          </p>
        </div>
      </section>
      {others.length ? (
        <section className="wrap" aria-labelledby="h-other">
          <div className="sec-head"><h2 id="h-other">Hotels near other beaches close by</h2><Link href="/hotels-near">All beaches</Link></div>
          <div className="chips">{others.map(({ x, d }) => <Link key={x.slug} className="chip" href={hotelsNearHref(x.slug)}>{x.name} <span className="muted">· {fmtD(d)}</span></Link>)}</div>
        </section>
      ) : null}
      {dest ? <AirportLine d={dest.id} name={dest.name} /> : null}
    </>
  );
}
