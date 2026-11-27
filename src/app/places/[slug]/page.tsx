import { JsonLd } from "@/components/JsonLd";
import { absolute } from "@/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PLACES, PLACE_BEACH, getDest, getPlace, linkedToPlace, photoFor, placeHref } from "@/lib/data";
import { reportMail } from "@/components/MapNote";
import { DetailHero, InfoList, Facilities, Around, AboutInfo } from "@/components/Detail";
import { ActionBar, FromYou } from "@/components/DetailClient";
import { KindIcon } from "@/components/KindIcon";
import { SeasonBanner } from "@/components/Season";
import { cyMonth } from "@/lib/season";
import { Crumbs } from "@/components/Bits";
import { beachFacts } from "@/components/BeachFacts";
import { directionsTo } from "@/lib/geo";
import Link from "next/link";
import { hotelsNearFor, hotelsNearHref } from "@/lib/hotelsNear";
import { UnescoBadge, UNESCO_NAMES, localityOf } from "@/components/Guide";

export const dynamicParams = false;
export function generateStaticParams() { return PLACES.map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getPlace((await params).slug);
  if (!p) return {};
  const img = photoFor(`place-${p.slug}`);
  return { title: p.name, description: p.intro, alternates: { canonical: placeHref(p.slug) }, openGraph: img ? { images: [img.u] } : undefined };
}

export default async function PlacePage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getPlace((await params).slug);
  if (!p) notFound();
  const d = getDest(p.dest)!;
  const href = placeHref(p.slug);
  const beach = PLACE_BEACH.get(p.slug);
  const stay = hotelsNearFor(beach?.i);
  const photo = photoFor(`place-${p.slug}`);
  const loc = localityOf(p);
  const linked = linkedToPlace(p.slug);
  const notice = p.notice ? (
    <div className="notice" role="status"><strong>Closed</strong><p>{p.notice.t} <a href={p.notice.src.u} target="_blank" rel="noopener noreferrer">Source</a></p></div>
  ) : null;
  const crumbs: [string, string?][] = [["Home", "/"], [d.name, `/destinations/${d.id}`], ...(loc ? [[loc.title, loc.href] as [string, string]] : []), [p.name]];
  const chips = beach ? [beach.bf ? "Blue Flag 2026" : "", beach.sf ?? "", beach.fac?.includes("Lifeguards") ? "Lifeguards" : ""].filter(Boolean) : [];
  const more = (p.nearby ?? []).filter((k) => k.startsWith("place-") && photoFor(k)).map((k) => getPlace(k.slice(6))).filter(Boolean) as NonNullable<ReturnType<typeof getPlace>>[];
  const ld = {
    "@context": "https://schema.org",
    "@type": beach ? "Beach" : "TouristAttraction",
    name: p.name,
    description: p.intro,
    url: absolute(href),
    ...(photo ? { image: photo.u } : {}),
    ...(p.ll ? { geo: { "@type": "GeoCoordinates", latitude: p.ll[0], longitude: p.ll[1] } } : {}),
    address: { "@type": "PostalAddress", addressRegion: d.name, addressCountry: "CY" },
    ...(p.unesco ? { additionalType: "https://schema.org/LandmarksOrHistoricalBuildings" } : {}),
  };
  return (
    <>
      <JsonLd data={ld} />
      <DetailHero photo={photo} ll={p.ll} tint={p.tint} eyebrow={`${p.cat} · ${p.loc ?? d.name}`} title={p.name} chips={chips} kind={beach ? "beach" : "sight"} />
      <div className="wrap dwrap">
        <Crumbs items={crumbs} />
        {p.unesco ? <UnescoBadge id={p.unesco} /> : null}
        <p className="dlead">{p.intro}</p>
        {notice}
        <SeasonBanner k={`place-${p.slug}`} built={cyMonth()} />
        <ActionBar dir={p.ll ? directionsTo(p.ll) : undefined} around={p.ll ? `${href}/around` : undefined} save={{ key: href, n: p.name, href, sub: `${p.cat} · ${d.name}` }} ask={`Tell me about ${p.name}`} />
        {p.ll ? <FromYou ll={p.ll} /> : null}
        <div className="dprose">
          {p.why ? <><h2>Why go</h2><p>{p.why}</p></> : null}
          {p.features.length ? <><h2>What you&apos;ll find</h2><ul>{p.features.map((x) => <li key={x}>{x}</li>)}</ul></> : null}
          {p.legend ? <div className="dquote"><span>Local legend</span><p>{p.legend}</p></div> : null}
          {p.how ? <><h2>Getting there</h2><p>{p.how}</p></> : null}
          {p.before ? <div className="dnote"><b>Before you go.</b> {p.before}</div> : null}
          {p.unesco ? <p className="dfine">One of the sites in the <Link href={`/unesco#${p.unesco}`}>{UNESCO_NAMES[p.unesco]}</Link> World Heritage property.</p> : null}
        </div>
        {beach ? <Facilities list={beach.fac ?? []} /> : null}
        {beach ? <InfoList rows={beachFacts(beach).filter(([l]) => l !== "Facilities" && l !== "Blue Flag" && l !== "Shore")} title="Good to know" /> : null}
        <InfoList rows={beach ? p.practical.filter(([l]) => !["Facilities", "Lifeguards", "Accessibility"].includes(l)) : p.practical} title="Practical" />
        {stay ? <Link className="dcard" href={hotelsNearHref(stay.slug)}><b>Hotels near {p.name}</b><span>Places to stay within an easy walk</span><i aria-hidden="true">›</i></Link> : null}
        {loc ? <Link className="dcard" href={loc.href}><b>{loc.title}</b><span>More in this part of {d.name}</span><i aria-hidden="true">›</i></Link> : null}
      </div>
      {linked.length ? (
        <section className="wrap dwrap" aria-labelledby="h-here">
          <div className="dsec">
            <h2 id="h-here" className="dsec-h">{linked.every((r) => r.k === "nature") ? "Walks from here" : "Walks and more here"}</h2>
            <ul className="nlist">{linked.map((r) => (
              <li key={r.i}><Link href={`/listing/${r.i}`} className="nrow"><KindIcon k={r.k} size={40} /><span className="nrow-t"><b>{r.n}</b><small>{[r.len, r.time, r.shape, r.grade ? `grade ${r.grade} of 3` : ""].filter(Boolean).join(" · ")}</small></span></Link></li>
            ))}</ul>
          </div>
        </section>
      ) : null}
      {p.ll ? <div className="wrap dwrap"><Around ll={p.ll} skip={`place-${p.slug}`} title="Around here" moreHref={`${href}/around`} /></div> : null}
      {more.length ? (
        <section className="wrap dwrap" aria-labelledby="h-more">
          <div className="dsec dsec-wide">
            <h2 id="h-more" className="dsec-h">You might also like</h2>
            <div className="bx-rail">
              {more.map((m) => {
                const ph = photoFor(`place-${m.slug}`)!;
                return (
                  <Link key={m.slug} href={placeHref(m.slug)} className="bx-pic">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ph.u.replace(/\/\d+px-/, "/500px-")} alt={ph.t} loading="lazy" decoding="async" />
                    <span className="bx-pic-txt"><b>{m.name}</b><small>{m.cat}</small></span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
      <AboutInfo sources={p.sources} reviewed={p.how ? "visitor guide, 22 November 2026. Check opening, access and return transport before you travel." : undefined}
        reportHref={reportMail(p.name, href)} name={p.name}
        extra={beach ? { title: "Beach sources", list: [beach.info ? { t: "Official beach page", u: beach.info } : null, beach.bw ? { t: "Bathing water profile (Department of Environment)", u: beach.bw } : null].filter(Boolean) as { t: string; u: string }[], note: "Facilities can change by season." } : undefined} />
    </>
  );
}
