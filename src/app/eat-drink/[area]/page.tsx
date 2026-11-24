import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DESTINATIONS } from "@/lib/data";
import { areaName, goingHref, goingPages, venuesIn } from "@/lib/going";
import type { DestId } from "@/lib/types";
import { PageHead } from "@/components/Bits";

type P = { params: Promise<{ area: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return DESTINATIONS.filter((d) => goingPages(d.id).length).map((d) => ({ area: d.id })); }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { area } = await params;
  if (!goingPages(area as DestId).length) return {};
  const n = areaName(area as DestId);
  return {
    title: `Where to eat and drink in ${n}`,
    description: `Restaurants, tavernas, cafés, bars and clubs in ${n}, by cuisine and type. Every licensed place, sorted by distance from where you're staying.`,
    alternates: { canonical: goingHref(area) },
  };
}

export default async function GoingArea({ params }: P) {
  const { area } = await params;
  const d = area as DestId;
  const pages = goingPages(d);
  if (!pages.length) notFound();
  const n = areaName(d);
  const types = pages.filter((p) => p.kind === "type");
  const eat = types.filter((p) => ["restaurants", "tavernas", "cafes"].includes(p.slug));
  const out = types.filter((p) => !["restaurants", "tavernas", "cafes"].includes(p.slug));
  const cuisines = pages.filter((p) => p.kind === "cuisine").sort((a, b) => b.list.length - a.list.length);
  const tile = (p: (typeof pages)[number]) => (
    <Link key={p.slug} className="going-tile" href={goingHref(d, p.slug)}><strong>{p.short}</strong><span>{p.list.length} places</span></Link>
  );
  return (
    <>
      <PageHead
        title={`Eat and drink in ${n}`}
        lead={`${venuesIn(d).length} licensed restaurants, cafés, bars and clubs, sorted by distance from where you're staying.`}
        crumbs={[["Home", "/"], ["Eat and drink", "/eat-drink"], [n]]}
      >
        <div className="chips" role="navigation" aria-label="Area">
          {DESTINATIONS.filter((x) => goingPages(x.id).length).map((x) => <Link key={x.id} className="chip stay-chip" href={goingHref(x.id)} aria-current={x.id === d ? "page" : undefined}>{areaName(x.id)}</Link>)}
        </div>
      </PageHead>
      {cuisines.length ? (
        <section className="wrap pad-top" aria-labelledby="h-cuisine">
          <div className="sec-head"><h2 id="h-cuisine">By cuisine</h2></div>
          <div className="going-grid">{cuisines.map(tile)}</div>
        </section>
      ) : null}
      <section className="wrap" aria-labelledby="h-eat">
        <div className="sec-head"><h2 id="h-eat">Restaurants and cafés</h2></div>
        <div className="going-grid">{eat.map(tile)}</div>
      </section>
      {out.length ? (
        <section className="wrap" aria-labelledby="h-out">
          <div className="sec-head"><h2 id="h-out">Going out</h2></div>
          <div className="going-grid">{out.map(tile)}</div>
        </section>
      ) : null}
      <section className="wrap">
        <p className="tag" style={{ maxWidth: 760 }}>
          From the Deputy Ministry of Tourism&apos;s register of licensed restaurants and bars. Our own picks of the best beach clubs, rooftops and tavernas are coming soon.
        </p>
      </section>
    </>
  );
}
