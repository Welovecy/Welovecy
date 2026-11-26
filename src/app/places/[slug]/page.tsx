import { JsonLd } from "@/components/JsonLd";
import { absolute } from "@/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PLACES, PLACE_BEACH, getDest, getPlace, linkedToPlace, photoFor, placeHref } from "@/lib/data";
import { ListRow } from "@/components/ListRow";
import { poiRow } from "@/lib/views";
import { Crumbs, Facts, Sources } from "@/components/Bits";
import { Photo } from "@/components/Photo";
import { SaveButton } from "@/components/SaveButton";
import { ShareButton } from "@/components/ShareButton";
import { FromBase } from "@/components/FromBase";
import { AroundBlock } from "@/components/AroundBlock";
import { NearbyCards } from "@/components/Cards";
import { BeachFacts, BeachSources } from "@/components/BeachFacts";
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
  const actions = (
    <div className="actions">
      {p.ll ? <a className="btn btn-primary" href={`${href}/around`}>See what&apos;s around</a> : null}
      {p.ll ? <a className="btn btn-ghost" href={directionsTo(p.ll)} target="_blank" rel="noopener noreferrer">Directions</a> : null}
      {stay ? <Link className="btn btn-ghost" href={hotelsNearHref(stay.slug)}>Hotels nearby</Link> : null}
      <SaveButton item={{ key: href, n: p.name, href, sub: `${p.cat} · ${d.name}` }} />
      <ShareButton title={p.name} />
    </div>
  );
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
      {photo ? (
        <div className="wrap hero">
          <Crumbs items={crumbs} />
          <div style={{ height: 16 }} />
          <Photo photo={photo} label={p.name} tint={p.tint} ratio="16/9" priority hero className="hero-photo" />
          <div className="hero-copy">
            <p className="eyebrow">{p.cat} · {d.name}</p>
            <h1 className="h-hero">{p.name}</h1>
            {p.unesco ? <UnescoBadge id={p.unesco} /> : null}
            <p className="lead">{p.intro}</p>
            {notice}
            {actions}
          </div>
        </div>
      ) : (
        <div className="wrap">
          <Crumbs items={crumbs} />
          <div className="around-head place-head" style={{ ["--tint" as string]: p.tint }}>
            <p className="eyebrow">{p.cat} · {p.loc ?? d.name}</p>
            <h1>{p.name}</h1>
            {p.unesco ? <UnescoBadge id={p.unesco} /> : null}
            <p className="lead" style={{ margin: 0 }}>{p.intro}</p>
            {notice}
            {p.ll ? <FromBase ll={p.ll} /> : null}
            {actions}
          </div>
        </div>
      )}
      <section className="wrap">
        <div className="split">
          <div className="prose">
            {p.why ? <><h2>Why visit</h2><p>{p.why}</p></> : null}
            {p.features.length ? <><h2>What you&apos;ll find</h2><ul className="list">{p.features.map((x) => <li key={x}>{x}</li>)}</ul></> : null}
            {p.legend ? <div className="legend"><span className="label">Local legend</span><p>{p.legend}</p></div> : null}
            {p.how ? <><h2>Getting there</h2><p>{p.how}</p></> : null}
            {p.before ? <div className="before"><span className="label">Before you go</span><p>{p.before}</p></div> : null}
            {beach ? <BeachFacts r={beach} /> : null}
            <h2>Practical</h2>
            <Facts rows={p.practical} />
            <Sources list={p.sources} reviewed={p.how ? "visitor guide, 22 November 2026. Check opening, access and return transport before you travel." : undefined} />
            {beach ? <BeachSources r={beach} /> : null}
          </div>
          <div className="panel">
            <h3 style={{ fontSize: 22 }}>Location</h3>
            <p>{p.loc ?? d.name}</p>
            {loc ? <p className="muted small">Part of <Link href={loc.href}>{loc.title}</Link></p> : null}
            {p.unesco ? <p className="muted small">One of the sites in the <Link href={`/unesco#${p.unesco}`}>{UNESCO_NAMES[p.unesco]}</Link> World Heritage property.</p> : null}
            {p.ll ? <a className="btn btn-ghost" href={directionsTo(p.ll)} target="_blank" rel="noopener noreferrer">Get directions</a> : null}
          </div>
        </div>
      </section>
      {linked.length ? (
        <section className="wrap" aria-labelledby="h-here">
          <div className="sec-head"><h2 id="h-here">{linked.every((r) => r.k === "nature") ? "Walks from here" : "Walks and more here"}</h2></div>
          <ul className="rows">{linked.map((r) => {
            const row = poiRow(r);
            return <ListRow key={r.i} {...row} sub={[r.cat, r.len, r.grade ? `grade ${r.grade} of 3` : ""].filter(Boolean).join(" · ")} />;
          })}</ul>
        </section>
      ) : null}
      {p.ll ? (
        <>
          {photo ? <section className="wrap" style={{ paddingBottom: 0 }}><FromBase ll={p.ll} /></section> : null}
          <AroundBlock ll={p.ll} skip={`place-${p.slug}`} title={`Near ${p.name}`} moreHref={`${href}/around`} />
        </>
      ) : null}
      {p.nearby?.length ? (
        <section className="wrap" aria-labelledby="h-near">
          <div className="sec-head"><h2 id="h-near">Nearby and related</h2></div>
          <div className="grid"><NearbyCards keys={p.nearby} /></div>
        </section>
      ) : null}
    </>
  );
}
