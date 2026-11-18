import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PLACES, PLACE_BEACH, getDest, getPlace, photoFor, placeHref } from "@/lib/data";
import { Crumbs, Facts, Sources } from "@/components/Bits";
import { Photo } from "@/components/Photo";
import { SaveButton } from "@/components/SaveButton";
import { ShareButton } from "@/components/ShareButton";
import { FromBase } from "@/components/FromBase";
import { AroundBlock } from "@/components/AroundBlock";
import { NearbyCards } from "@/components/Cards";
import { BeachFacts, BeachSources } from "@/components/BeachFacts";
import { directionsTo } from "@/lib/geo";

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
  return (
    <>
      <div className="wrap hero">
        <Crumbs items={[["Home", "/"], [d.name, `/destinations/${d.id}`], [p.name]]} />
        <div style={{ height: 16 }} />
        <Photo photo={photoFor(`place-${p.slug}`)} label={p.name} tint={p.tint} ratio="16/9" priority hero className="hero-photo" />
        <div className="hero-copy">
          <p className="eyebrow">{p.cat} · {d.name}</p>
          <h1 className="h-hero">{p.name}</h1>
          <p className="lead">{p.intro}</p>
          <div className="actions">
            {p.ll ? <a className="btn btn-primary" href={`${href}/around`}>See what&apos;s around</a> : null}
            <SaveButton item={{ key: href, n: p.name, href, sub: `${p.cat} · ${d.name}` }} />
            <ShareButton title={p.name} />
          </div>
        </div>
      </div>
      <section className="wrap">
        <div className="split">
          <div className="prose">
            <h2>Why visit</h2>
            <p>{p.why}</p>
            <h2>What you&apos;ll find</h2>
            <ul className="list">{p.features.map((x) => <li key={x}>{x}</li>)}</ul>
            {p.legend ? <div className="legend"><span className="label">Local legend</span><p>{p.legend}</p></div> : null}
            {beach ? <BeachFacts r={beach} /> : null}
            <h2>Practical</h2>
            <Facts rows={p.practical} />
            <Sources list={p.sources} />
            {beach ? <BeachSources r={beach} /> : null}
          </div>
          <div className="panel">
            <h3 style={{ fontSize: 22 }}>Location</h3>
            <p>{d.name}</p>
            {p.ll ? <a className="btn btn-ghost" href={directionsTo(p.ll)} target="_blank" rel="noopener noreferrer">Get directions</a> : null}
          </div>
        </div>
      </section>
      {p.ll ? (
        <>
          <section className="wrap" style={{ paddingBottom: 0 }}><FromBase ll={p.ll} /></section>
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
