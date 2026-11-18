import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DESTINATIONS, getDest } from "@/lib/data";
import { PageHead } from "@/components/Bits";
import { ListRow } from "@/components/ListRow";
import { StayPanel } from "@/components/StayPanel";
import { bizRow, staysBySea, staysIn } from "@/lib/views";
import { fmtD } from "@/lib/geo";

type P = { params: Promise<{ area: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return DESTINATIONS.map((d) => ({ area: d.id })); }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const d = getDest((await params).area);
  return d ? { title: `Where to stay in ${d.name}`, description: `Licensed hotels and apartments in ${d.name}, ranked by distance to the sea where mapped.` } : {};
}

export default async function StayArea({ params }: P) {
  const d = getDest((await params).area);
  if (!d) notFound();
  const mapped = staysBySea(d.id);
  const ids = new Set(mapped.map((m) => m.b.i));
  const rest = staysIn(d.id).filter((b) => !ids.has(b.i)).sort((a, b) => a.n.localeCompare(b.n));
  return (
    <>
      <PageHead title={`Where to stay in ${d.name}`} lead="Every licensed hotel and apartment in the area, from the official tourism register." crumbs={[["Home", "/"], ["Where to stay", "/stay"], [d.name]]}>
        <div className="chips">
          {DESTINATIONS.map((x) => <Link key={x.id} className="chip stay-chip" href={`/stay/${x.id}`} aria-current={x.id === d.id ? "page" : undefined}>{x.name}</Link>)}
        </div>
      </PageHead>
      <section className="wrap" style={{ paddingTop: 24 }}>
        <div className="split">
          <div className="near-group">
            {mapped.length ? (
              <>
                <h2 style={{ fontSize: 26 }}>Closest to the sea</h2>
                <ul className="rows">{mapped.map((o) => <ListRow key={o.b.i} {...bizRow(o.b, o.beach ? `${fmtD(o.d)} to ${o.beach.n}` : undefined)} save />)}</ul>
              </>
            ) : null}
            {rest.length ? (
              <>
                <h2 style={{ fontSize: 26, marginTop: mapped.length ? 24 : 0 }}>{mapped.length ? "Not mapped yet" : "Places to stay"}</h2>
                <p className="tag">We&apos;re adding exact locations. Until then, directions search the address.</p>
                <ul className="rows">{rest.map((b) => <ListRow key={b.i} {...bizRow(b)} save />)}</ul>
              </>
            ) : null}
          </div>
          <StayPanel dest={d.id} destName={d.name} />
        </div>
      </section>
    </>
  );
}
