import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  BUSINESSES, POIS, bizDirections, bizSub, getBusiness, getDest, getPlace, getPoi, isStay, listingHref, placeForPoi, placeHref, poiDirections, poiSub, photoFor,
} from "@/lib/data";
import { bizFacts, bizSources, poiFacts, poiSources } from "@/lib/listing";
import { Crumbs, Facts, KindDot, Sources } from "@/components/Bits";
import { SaveButton } from "@/components/SaveButton";
import { FromBase } from "@/components/FromBase";
import { AroundBlock } from "@/components/AroundBlock";
import { StayHere } from "@/components/StayHere";
import { absolute } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { districtsFor, dutyHref, onRota } from "@/lib/duty";
import { KINDS } from "@/lib/kinds";
import { hotelsNearFor, hotelsNearHref } from "@/lib/hotelsNear";
import { InHotel } from "@/components/InHotel";
import { Photo } from "@/components/Photo";
import { ReportPin } from "@/components/MapNote";
import { SeasonBanner } from "@/components/Season";
import { cyMonth } from "@/lib/season";

type P = { params: Promise<{ id: string }> };

export const dynamicParams = true;
/** Places to stay and every beach, pharmacy, clinic and shop are built ahead. Restaurants render on first visit, then stay cached. */
export function generateStaticParams() {
  return [...BUSINESSES.filter(isStay).map((b) => ({ id: b.i })), ...POIS.filter((r) => !placeForPoi(r.i)).map((r) => ({ id: r.i }))];
}

function find(id: string) {
  const key = decodeURIComponent(id);
  return { b: getBusiness(key), r: getPoi(key), key };
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { b, r } = find((await params).id);
  if (b) return { title: b.n, description: `${bizSub(b)}. Address, contact details and what's around.`, alternates: { canonical: listingHref(b.i) } };
  if (r) return { title: r.n, description: `${poiSub(r)}${r.tw ? ` in ${r.tw}` : ""}. Details, directions and what's around.`, alternates: { canonical: listingHref(r.i) } };
  return {};
}

export default async function ListingPage({ params }: P) {
  const { b, r } = find((await params).id);
  if (r) {
    const place = placeForPoi(r.i);
    if (place) permanentRedirect(placeHref(place));
    return <PoiView id={r.i} />;
  }
  if (!b) notFound();
  const href = listingHref(b.i);
  const d = getDest(b.d)!;
  const stay = isStay(b);
  const src = bizSources(b);
  const base = stay && b.ll ? { id: b.i, n: b.n, ll: b.ll, href, around: `${href}/around`, area: b.d } : undefined;
  const photo = photoFor(`biz-${b.i}`);
  return (
    <>
      <div className="wrap">
        <Crumbs items={[["Home", "/"], [stay ? "Where to stay" : d.name, stay ? `/stay/${d.id}` : `/destinations/${d.id}`], [b.n]]} />
        {photo ? <Photo photo={photo} label={b.n} tint="#2E6E8E" ratio="21/9" priority hero className="g-photo" /> : null}
        <div className="biz-head">
          <p className="eyebrow">{bizSub(b)}</p>
          <h1>{b.n}</h1>
          {b.in && getBusiness(b.in) ? <p className="lead" style={{ marginTop: 6 }}>{b.fl ? `${b.fl} of ` : "Inside "}<Link href={listingHref(b.in)}>{getBusiness(b.in)!.n}</Link></p> : null}
          {b.at && getPoi(b.at) ? <p className="lead" style={{ marginTop: 6 }}>Inside <Link href={listingHref(b.at)}>{getPoi(b.at)!.n}</Link></p> : null}
          <SeasonBanner k={b.i} built={cyMonth()} />
          {b.ll ? <FromBase ll={b.ll} skip={b.i} /> : null}
          <div className="actions">
            {b.ll ? <Link className="btn btn-primary" href={`${href}/around`}>See what&apos;s around</Link> : null}
            {base ? <StayHere base={base} /> : null}
            <a className="btn btn-ghost" href={bizDirections(b)} target="_blank" rel="noopener noreferrer">Get directions</a>
            {b.w ? <a className="btn btn-ghost" href={b.w} target="_blank" rel="noopener noreferrer">Website</a> : null}
            <SaveButton item={{ key: href, n: b.n, href, sub: bizSub(b) }} />
          </div>
        </div>
      </div>
      <section className="wrap" style={{ paddingBottom: 0 }}>
        <div className="prose" style={{ maxWidth: 760 }}>
          {stay && districtsFor(b.d).length ? (
            <p className="basebar plain">Need a pharmacy tonight? <Link href={dutyHref(districtsFor(b.d)[0].id)}>See the duty pharmacies near here</Link>.</p>
          ) : null}
          <h2>Details</h2>
          <Facts rows={bizFacts(b)} />
          <Sources list={src.list} reviewed={src.reviewed} />
          <ReportPin name={b.n} href={href} />
          <p className="muted small">Run this business? <Link href="/list-your-business#update">Suggest an update</Link>.</p>
        </div>
      </section>
      {stay ? <InHotel hotelId={b.i} hotelName={b.n} /> : null}
      {b.ll ? <AroundBlock ll={b.ll} skip={b.i} title={stay ? "Around this hotel" : "Near here"} moreHref={`${href}/around`} /> : null}
    </>
  );
}

function PoiView({ id }: { id: string }) {
  const r = getPoi(id)!;
  const K = KINDS[r.k];
  const href = listingHref(r.i);
  const src = poiSources(r);
  const isBeach = r.k === "beach";
  const photo = isBeach ? photoFor(`beach-${r.i}`) : undefined;
  const type = isBeach ? "Beach" : r.k === "pharmacy" ? "Pharmacy" : r.k === "health" ? "MedicalClinic" : r.k === "market" ? "GroceryStore" : "TouristAttraction";
  const ld = {
    "@context": "https://schema.org", "@type": type, name: r.n, url: absolute(href),
    ...(photo ? { image: photo.u } : {}),
    ...(r.ll && r.pr !== "approx" ? { geo: { "@type": "GeoCoordinates", latitude: r.ll[0], longitude: r.ll[1] } } : {}),
    address: { "@type": "PostalAddress", ...(r.a ? { streetAddress: r.a } : {}), ...(r.tw ? { addressLocality: r.tw } : {}), addressCountry: "CY" },
    ...(r.ph && /^\d{8}$/.test(String(r.ph)) ? { telephone: `+357${r.ph}` } : {}),
    ...(isBeach && r.bf ? { award: "Blue Flag 2026" } : {}),
  };
  return (
    <>
      <JsonLd data={ld} />
      <div className="wrap">
        <Crumbs items={[["Home", "/"], [isBeach ? "Beaches" : ["sight", "family", "activity", "nature"].includes(r.k) ? "Must-see" : "Essentials", isBeach ? "/beaches" : ["sight", "family", "activity", "nature"].includes(r.k) ? "/must-see" : `/essentials/${r.d}/${r.k}`], [r.n]]} />
        <div className="around-head">
          <p className="eyebrow"><KindDot color={K.c} /> <span style={{ marginLeft: 6 }}>{poiSub(r)}{r.tw ? ` · ${r.tw}` : ""}</span></p>
          <h1>{r.n}</h1>
          {r.desc ? <p className="lead" style={{ marginTop: 6 }}>{r.desc}</p> : null}
          {r.place && getPlace(r.place) ? <p className="lead" style={{ marginTop: 6 }}>{r.k === "nature" && r.cat === "Nature trail" ? "Starts at " : "At "}<Link href={placeHref(r.place)}>{getPlace(r.place)!.name}</Link></p> : null}
          {r.notice ? <div className="notice" role="status"><strong>Check first</strong><p>{r.notice}</p></div> : null}
          <SeasonBanner k={r.i} built={cyMonth()} />
          {r.bf ? <p><span className="flag flag-accent">Blue Flag 2026</span></p> : null}
          {r.ll && r.pr !== "approx" ? <FromBase ll={r.ll} /> : null}
          <div className="actions">
            {r.ll ? <Link className="btn btn-primary" href={`${href}/around`}>See what&apos;s around</Link> : null}
            {r.sea ? null : <a className="btn btn-ghost" href={poiDirections(r)} target="_blank" rel="noopener noreferrer">Get directions</a>}
            {r.web ? <a className="btn btn-ghost" href={r.web} target="_blank" rel="noopener noreferrer">Website</a> : null}
            {isBeach && hotelsNearFor(r.i) ? <Link className="btn btn-ghost" href={hotelsNearHref(hotelsNearFor(r.i)!.slug)}>Hotels nearby</Link> : null}
            <SaveButton item={{ key: href, n: r.n, href, sub: poiSub(r) }} />
          </div>
        </div>
      </div>
      {photo ? <div className="wrap"><Photo photo={photo} label={r.n} tint="#2E6E8E" ratio="21/9" priority hero className="g-photo" /></div> : null}
      <section className="wrap" style={{ paddingBottom: 0 }}>
        <div className="prose" style={{ maxWidth: 760 }}>
          {r.k === "pharmacy" ? (
            <p className="basebar plain">
              Listed in the official pharmacy register.{onRota(r.i) ? " It takes turns on the official duty rota." : ""}{" "}
              {districtsFor(r.d).length ? <Link href={dutyHref(districtsFor(r.d)[0].id)}>See which pharmacies are on duty tonight</Link> : null}
            </p>
          ) : null}
          {r.k === "health" ? <p className="basebar plain">In an emergency call <strong>112</strong> or <strong>199</strong>. Services and opening hours are not confirmed here.</p> : null}
          <h2>Details</h2>
          <Facts rows={poiFacts(r)} />
          <Sources list={src.list} reviewed={src.reviewed} />
          <ReportPin name={r.n} href={href} />
        </div>
      </section>
      {r.inside?.length ? <InHotel hotelId={r.i} hotelName={r.n} place /> : null}
      {r.ll ? <AroundBlock ll={r.ll} skip={r.i} title="Near here" moreHref={`${href}/around`} /> : null}
    </>
  );
}
