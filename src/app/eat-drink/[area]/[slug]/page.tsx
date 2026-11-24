import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GOING, areaName, getGoing, goingHref, goingPages, origins, rowsFor } from "@/lib/going";
import type { DestId } from "@/lib/types";
import { PageHead } from "@/components/Bits";
import { GoingList } from "@/components/GoingList";
import { JsonLd } from "@/components/JsonLd";
import { absolute } from "@/lib/site";

type P = { params: Promise<{ area: string; slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return GOING.map((g) => ({ area: g.area, slug: g.slug })); }

const SCHEMA: Record<string, string> = { bars: "BarOrPub", pubs: "BarOrPub", clubs: "NightClub", "beach-bars": "BarOrPub", cafes: "CafeOrCoffeeShop" };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { area, slug } = await params;
  const g = getGoing(area, slug);
  if (!g) return {};
  return {
    title: g.title,
    description: `${g.list.length} licensed ${g.short.toLowerCase()} places in ${areaName(g.area)}, from the official register. Sorted by distance from the centre or your neighbourhood, with walking times and directions.`,
    alternates: { canonical: goingHref(g.area, g.slug) },
  };
}

export default async function GoingPageView({ params }: P) {
  const { area, slug } = await params;
  const g = getGoing(area, slug);
  if (!g) notFound();
  const d = g.area as DestId;
  const rows = rowsFor(g.list, d);
  const out = ["bars", "pubs", "clubs", "beach-bars"].includes(g.slug);
  const others = goingPages(d).filter((p) => p.slug !== g.slug);
  const ld = {
    "@context": "https://schema.org", "@type": "ItemList", name: g.title,
    itemListElement: rows.slice(0, 30).map((r, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": SCHEMA[g.slug] ?? "Restaurant", name: r.n, url: absolute(r.href) } })),
  };
  return (
    <>
      <JsonLd data={ld} />
      <PageHead
        title={g.title}
        lead={`${g.list.length} licensed places, closest first. Pick a neighbourhood to sort from where you're staying.`}
        crumbs={[["Home", "/"], ["Eat and drink", "/eat-drink"], [areaName(d), goingHref(d)], [g.short]]}
      />
      <section className="wrap pad-top">
        <GoingList rows={rows} origins={origins(d)} mono={out ? "N" : "E"} color={out ? "var(--k-night)" : "var(--k-eat)"} />
        <p className="tag" style={{ marginTop: 18, maxWidth: 760 }}>
          Every place here holds a licence from the Deputy Ministry of Tourism. Type and cuisine come from the licence, the name and OpenStreetMap, so a few may be missing or broader than the menu. Opening times vary by season, so check before you go.
        </p>
      </section>
      <section className="wrap" aria-labelledby="h-more">
        <div className="sec-head"><h2 id="h-more">More in {areaName(d)}</h2><Link href={goingHref(d)}>All eat and drink</Link></div>
        <div className="chips">{others.map((p) => <Link key={p.slug} className="chip" href={goingHref(d, p.slug)}>{p.short} <span className="muted">· {p.list.length}</span></Link>)}</div>
      </section>
    </>
  );
}
