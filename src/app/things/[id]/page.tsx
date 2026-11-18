import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { INTERESTS, PLACES, getInterest } from "@/lib/data";
import { PageHead } from "@/components/Bits";
import { PlaceCard } from "@/components/Cards";

type P = { params: Promise<{ id: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return INTERESTS.map((i) => ({ id: i.id })); }
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const i = getInterest((await params).id);
  return i ? { title: i.name, description: i.line } : {};
}

export default async function Interest({ params }: P) {
  const it = getInterest((await params).id);
  if (!it) notFound();
  const list = PLACES.filter((p) => p.interests.includes(it.id));
  return (
    <>
      <PageHead title={it.name} lead={`${it.line}.`} crumbs={[["Home", "/"], ["Things to do", "/things"], [it.name]]} />
      <section className="wrap pad-top">
        {list.length ? <div className="grid">{list.map((p) => <PlaceCard key={p.slug} p={p} />)}</div>
          : <div className="empty"><h2 style={{ fontSize: 24 }}>Nothing here yet.</h2><p className="muted">{it.name} places arrive as each area guide is published.</p></div>}
        <p className="muted small" style={{ marginTop: 24 }}>More places join as each area guide is written.</p>
      </section>
    </>
  );
}
