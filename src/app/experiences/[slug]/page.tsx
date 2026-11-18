import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EXPERIENCES, getDest, getExperience, getMaker, getPlace, photoFor } from "@/lib/data";
import { Crumbs, Facts, Sources } from "@/components/Bits";
import { Photo } from "@/components/Photo";
import { SaveButton } from "@/components/SaveButton";
import { MakerCard } from "@/components/Cards";

type P = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return EXPERIENCES.map((e) => ({ slug: e.slug })); }
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const e = getExperience((await params).slug);
  return e ? { title: e.name, description: e.intro, robots: e.sample ? { index: false } : undefined } : {};
}

export default async function ExperiencePage({ params }: P) {
  const e = getExperience((await params).slug);
  if (!e) notFound();
  const d = getDest(e.dest)!, p = getPlace(e.place), m = getMaker(e.business);
  const href = `/experiences/${e.slug}`;
  return (
    <>
      <div className="wrap hero">
        <Crumbs items={[["Home", "/"], [d.name, `/destinations/${d.id}`], ...(p ? [[p.name, `/places/${p.slug}`] as [string, string]] : []), ["Craft experience"]]} />
        <div style={{ height: 16 }} />
        <Photo photo={photoFor(`exp-${e.slug}`)} label="A maker at work" tint={e.tint} ratio="16/9" priority hero className="hero-photo" />
        <div className="hero-copy">
          <p className="eyebrow">Craft experience{p ? ` · ${p.name}` : ""}</p>
          <h1 className="h-page">{e.name}</h1>
          <p className="lead">{e.intro}</p>
          {e.sample ? <p><span className="flag">Sample experience</span></p> : null}
          <div className="actions"><SaveButton item={{ key: href, n: e.name, href, sub: "Craft experience" }} /></div>
        </div>
      </div>
      <section className="wrap">
        <div className="split">
          <div className="prose">
            <p>{e.detail}</p>
            <h2>Details</h2>
            <Facts rows={e.practical} />
            <Sources list={[{ t: "UNESCO: Lefkara laces or Lefkaritika", u: "https://ich.unesco.org/en/RL/lefkara-laces-or-lefkaritika-00255" }]} />
          </div>
          {m ? <div className="panel"><h3 style={{ fontSize: 22 }}>Hosted by</h3><MakerCard m={m} /></div> : null}
        </div>
      </section>
    </>
  );
}
