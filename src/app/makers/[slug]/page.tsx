import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MAKERS, getDest, getMaker, photoFor } from "@/lib/data";
import { Crumbs, Facts } from "@/components/Bits";
import { Photo } from "@/components/Photo";
import { SaveButton } from "@/components/SaveButton";

type P = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return MAKERS.map((m) => ({ slug: m.slug })); }
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const m = getMaker((await params).slug);
  return m ? { title: m.name.replace(/[[\]]/g, ""), description: m.line, robots: m.sample ? { index: false } : undefined } : {};
}

export default async function MakerPage({ params }: P) {
  const m = getMaker((await params).slug);
  if (!m) notFound();
  const d = getDest(m.dest)!;
  const href = `/makers/${m.slug}`;
  return (
    <>
      <div className="wrap hero">
        <Crumbs items={[["Home", "/"], [d.name, `/destinations/${d.id}`], [m.name]]} />
        <div style={{ height: 16 }} />
        <Photo photo={photoFor(`biz-${m.slug}`)} label="Inside the workshop" tint={m.tint} ratio="16/9" priority hero className="hero-photo" />
        <div className="hero-copy">
          <p className="eyebrow">{m.cat} · {m.locality}</p>
          <h1 className="h-page">{m.name}</h1>
          <p className="lead">{m.line}</p>
          {m.sample ? <p><span className="flag">Sample listing. The real business will be featured once confirmed.</span></p> : null}
          <div className="actions">
            <SaveButton item={{ key: href, n: m.name, href, sub: m.cat }} />
            <Link className="save" href="/list-your-business#update">Suggest an update</Link>
          </div>
        </div>
      </div>
      <section className="wrap">
        <div className="split">
          <div className="prose">
            <h2>What they offer</h2>
            <ul className="list">{m.services.map((s) => <li key={s}>{s}</li>)}</ul>
            <h2>Gallery</h2>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))" }}>
              <Photo photo={photoFor("g1")} label="Lace" tint="#7D7468" ratio="1/1" />
              <Photo photo={photoFor("g2")} label="Lace" tint="#6A665F" ratio="1/1" />
              <Photo photo={photoFor("g3")} label="Lefkara" tint="#857B6E" ratio="1/1" />
            </div>
            <h2>Contact and hours</h2>
            <Facts rows={m.practical} />
          </div>
          <div className="panel">
            <h3 style={{ fontSize: 22 }}>Where</h3>
            <p>{m.locality}, {d.name}</p>
            <Link className="btn btn-ghost" href="/places/lefkara">About Lefkara</Link>
          </div>
        </div>
      </section>
    </>
  );
}
