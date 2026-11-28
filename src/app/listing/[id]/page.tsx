import { AskAbout } from "@/components/AskAbout";
import { ogMeta } from "@/lib/og";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  BUSINESSES, POIS, bizDirections, bizSub, getBusiness, getDest, getPlace, getPoi, isStay, listingHref, placeForPoi, placeHref, poiDirections, poiSub, photoFor,
} from "@/lib/data";
import { bizFacts, bizSources, poiFacts, poiSources } from "@/lib/listing";
import { Crumbs } from "@/components/Bits";
import { absolute } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { districtsFor, dutyHref, onRota } from "@/lib/duty";
import { hotelsNearFor, hotelsNearHref } from "@/lib/hotelsNear";
import { InHotel } from "@/components/InHotel";
import { reportMail } from "@/components/MapNote";
import { DetailHero, InfoList, Facilities, Around, AboutInfo } from "@/components/Detail";
import { ActionBar, FromYou } from "@/components/DetailClient";
import { beachFacts } from "@/components/BeachFacts";
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
  if (b) return { title: b.n, description: `${bizSub(b)}. Address, contact details and what's around.`, alternates: { canonical: listingHref(b.i) }, openGraph: ogMeta(listingHref(b.i)) };
  if (r) return { title: r.n, description: `${poiSub(r)}${r.tw ? ` in ${r.tw}` : ""}. Details, directions and what's around.`, alternates: { canonical: listingHref(r.i) }, openGraph: ogMeta(listingHref(r.i)) };
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
  const tel = b.p ? telOf(String(b.p).split(/[,/]/)[0]) : undefined;
  const host = b.in ? getBusiness(b.in) : undefined;
  const inside = b.at ? getPoi(b.at) : undefined;
  return (
    <>
      <DetailHero photo={photo} ll={b.ll} tint={stay ? "#3F5E7A" : "#8A4B3C"} eyebrow={bizSub(b)} title={b.n} kind={stay ? "stay" : b.g === "night" ? "night" : "eat"} />
      <div className="wrap dwrap">
        <Crumbs items={[["Home", "/"], [stay ? "Where to stay" : d.name, stay ? `/stay/${d.id}` : `/destinations/${d.id}`], [b.n]]} />
        {host ? <p className="dlead">{b.fl ? `${b.fl} of ` : "Inside "}<Link href={listingHref(host.i)}>{host.n}</Link></p> : null}
        {inside ? <p className="dlead">Inside <Link href={listingHref(inside.i)}>{inside.n}</Link></p> : null}
        <SeasonBanner k={b.i} built={cyMonth()} />
        <ActionBar dir={bizDirections(b)} around={b.ll ? `${href}/around` : undefined} tel={tel} web={b.w} save={{ key: href, n: b.n, href, sub: bizSub(b) }} ask={stay ? `What's near ${b.n}?` : `Tell me about ${b.n}`} />
        {b.ll ? <FromYou ll={b.ll} skip={b.i} stayAs={base} /> : null}
        <InfoList rows={bizFacts(b).filter(([l]) => l !== "Type")} />
        {stay && districtsFor(b.d).length ? (
          <Link className="dcard" href={dutyHref(districtsFor(b.d)[0].id)}><b>Need a pharmacy tonight?</b><span>See the duty pharmacies near here</span><i aria-hidden="true">›</i></Link>
        ) : null}
      </div>
      {stay ? <InHotel hotelId={b.i} hotelName={b.n} /> : null}
      <div className="wrap dwrap"><AskAbout name={b.n} k={stay ? "stay" : b.g === "night" ? "night" : "eat"} page={href} /></div>
      {b.ll ? <div className="wrap dwrap"><Around ll={b.ll} skip={b.i} title={stay ? "Around this hotel" : "Around here"} moreHref={`${href}/around`} /></div> : null}
      <AboutInfo sources={src.list} reviewed={src.reviewed} reportHref={reportMail(b.n, href)} name={b.n}
        more={<p className="ai-note">Run this business? <Link href="/list-your-business#update">Suggest an update</Link>.</p>} />
    </>
  );
}

const telOf = (n?: string) => {
  if (!n) return undefined;
  const t = n.trim();
  if (/^\+/.test(t)) return t.replace(/\s/g, "");
  const dg = t.replace(/\D/g, "");
  return dg.length === 8 ? `+357${dg}` : undefined;
};

function PoiView({ id }: { id: string }) {
  const r = getPoi(id)!;
  const href = listingHref(r.i);
  const src = poiSources(r);
  const isBeach = r.k === "beach";
  const photo = photoFor(isBeach ? `beach-${r.i}` : `poi-${r.i}`);
  const type = isBeach ? "Beach" : r.k === "pharmacy" ? "Pharmacy" : r.k === "health" ? "MedicalClinic" : r.k === "market" ? "GroceryStore" : "TouristAttraction";
  const ld = {
    "@context": "https://schema.org", "@type": type, name: r.n, url: absolute(href),
    ...(photo ? { image: photo.u } : {}),
    ...(r.ll && r.pr !== "approx" ? { geo: { "@type": "GeoCoordinates", latitude: r.ll[0], longitude: r.ll[1] } } : {}),
    address: { "@type": "PostalAddress", ...(r.a ? { streetAddress: r.a } : {}), ...(r.tw ? { addressLocality: r.tw } : {}), addressCountry: "CY" },
    ...(r.ph && /^\d{8}$/.test(String(r.ph)) ? { telephone: `+357${r.ph}` } : {}),
    ...(isBeach && r.bf ? { award: "Blue Flag 2026" } : {}),
  };
  const sightish = ["sight", "family", "activity", "nature"].includes(r.k);
  const chips = (isBeach
    ? [r.bf ? "Blue Flag 2026" : "", r.sf ?? "", r.fac?.includes("Lifeguards") ? "Lifeguards" : ""]
    : [r.len ?? "", r.time ?? "", r.grade ? `Grade ${r.grade} of 3` : "", r.shape === "loop" ? "Loop" : ""]).filter(Boolean);
  const facts = isBeach ? beachFacts(r).filter(([l]) => l !== "Facilities" && l !== "Blue Flag" && l !== "Shore") : poiFacts(r).filter(([l]) => l !== "Type");
  const near = isBeach ? hotelsNearFor(r.i) : undefined;
  const pl = r.place ? getPlace(r.place) : undefined;
  return (
    <>
      <JsonLd data={ld} />
      <DetailHero photo={photo} ll={r.ll} eyebrow={`${isBeach ? "Beach" : poiSub(r)}${r.tw ? ` · ${r.tw}` : ""}`} title={r.n} chips={chips} kind={r.k} tint={isBeach ? "#2E6E8E" : "#6B5A3E"} />
      <div className="wrap dwrap">
        <Crumbs items={[["Home", "/"], [isBeach ? "Beaches" : sightish ? "Must-see" : "Essentials", isBeach ? "/beaches" : sightish ? "/must-see" : `/essentials/${r.d}/${r.k}`], [r.n]]} />
        {r.desc ? <p className="dlead">{r.desc}</p> : null}
        {pl ? <p className="dlead">{r.k === "nature" && r.cat === "Nature trail" ? "Starts at " : "At "}<Link href={placeHref(pl.slug)}>{pl.name}</Link></p> : null}
        {r.notice ? <div className="notice" role="status"><strong>Check first</strong><p>{r.notice}</p></div> : null}
        <SeasonBanner k={r.i} built={cyMonth()} />
        <ActionBar dir={r.sea ? undefined : poiDirections(r)} around={r.ll ? `${href}/around` : undefined} tel={telOf(r.ph ? String(r.ph) : undefined)} web={r.web ?? undefined} save={{ key: href, n: r.n, href, sub: poiSub(r) }} ask={isBeach ? `What's ${r.n} like?` : `Tell me about ${r.n}`} />
        {r.ll && r.pr !== "approx" ? <FromYou ll={r.ll} /> : null}
        {r.k === "pharmacy" ? (
          <p className="dnote">Listed in the official pharmacy register.{onRota(r.i) ? " It takes turns on the official duty rota." : ""} {districtsFor(r.d).length ? <Link href={dutyHref(districtsFor(r.d)[0].id)}>See tonight&apos;s duty pharmacies</Link> : null}</p>
        ) : null}
        {r.k === "health" ? <p className="dnote">In an emergency call <strong>112</strong> or <strong>199</strong>.</p> : null}
        {isBeach ? <Facilities list={r.fac ?? []} /> : null}
        <InfoList rows={facts} title={isBeach ? "Good to know" : "Details"} />
        {near ? <Link className="dcard" href={hotelsNearHref(near.slug)}><b>Hotels near {r.n}</b><span>Places to stay within an easy walk</span><i aria-hidden="true">›</i></Link> : null}
      </div>
      {r.inside?.length ? <InHotel hotelId={r.i} hotelName={r.n} place /> : null}
      {["beach", "sight", "nature", "family", "activity"].includes(r.k) ? <div className="wrap dwrap"><AskAbout name={r.n} k={r.k as "beach"} page={href} /></div> : null}
      {r.ll ? <div className="wrap dwrap"><Around ll={r.ll} skip={r.i} title="Around here" moreHref={`${href}/around`} /></div> : null}
      <AboutInfo sources={src.list} reviewed={src.reviewed} reportHref={reportMail(r.n, href)} name={r.n}
        extra={isBeach ? { title: "Beach sources", list: [r.info ? { t: "Official beach page", u: r.info } : null, r.bw ? { t: "Bathing water profile (Department of Environment)", u: r.bw } : null, r.su && r.su !== r.info ? { t: "Source listing", u: r.su } : null].filter(Boolean) as { t: string; u: string }[], note: "Facilities can change by season." } : undefined} />
    </>
  );
}
