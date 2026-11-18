import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DESTINATIONS, POIS, getDest } from "@/lib/data";
import { PageHead } from "@/components/Bits";
import { ListRow } from "@/components/ListRow";
import { poiRow } from "@/lib/views";
import { ESS_KINDS } from "../../kinds";

type P = { params: Promise<{ area: string; kind: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return DESTINATIONS.flatMap((d) => ESS_KINDS.map(([k]) => ({ area: d.id, kind: k }))); }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { area, kind } = await params;
  const d = getDest(area), k = ESS_KINDS.find(([x]) => x === kind);
  return d && k ? { title: `${k[1]} in ${d.name}`, description: `${k[1]} in ${d.name}, with addresses, phone numbers and directions.` } : {};
}

export default async function EssentialsList({ params }: P) {
  const { area, kind } = await params;
  const d = getDest(area), k = ESS_KINDS.find(([x]) => x === kind);
  if (!d || !k) notFound();
  const list = POIS.filter((r) => r.d === d.id && r.k === k[0] && r.src !== "osm")
    .sort((a, b) => (a.tw || "").localeCompare(b.tw || "") || a.n.localeCompare(b.n));
  return (
    <>
      <PageHead title={`${k[1]} in ${d.name}`} crumbs={[["Home", "/"], ["Essentials", "/essentials"], [d.name]]}>
        <div className="chips" role="navigation" aria-label="Type">
          {ESS_KINDS.map(([x, n]) => <Link key={x} className="chip stay-chip" href={`/essentials/${d.id}/${x}`} aria-current={x === k[0] ? "page" : undefined}>{n}</Link>)}
        </div>
        <div className="chips" role="navigation" aria-label="Area">
          {DESTINATIONS.map((x) => <Link key={x.id} className="chip stay-chip" href={`/essentials/${x.id}/${k[0]}`} aria-current={x.id === d.id ? "page" : undefined}>{x.name}</Link>)}
        </div>
      </PageHead>
      <section className="wrap pad-top">
        {list.length ? (
          <>
            <p className="dir-count" style={{ marginBottom: 10 }}>{list.length} listed</p>
            <ul className="rows">{list.map((r) => <ListRow key={r.i} {...poiRow(r)} sub={[poiRow(r).sub, r.a].filter(Boolean).join(" · ")} />)}</ul>
          </>
        ) : <div className="empty"><p>None listed for this area yet.</p></div>}
        <p className="tag" style={{ marginTop: 16 }}>In an emergency call 112 or 199. Listings come from official registers and chain store finders, retrieved 18 November 2026.</p>
      </section>
    </>
  );
}
