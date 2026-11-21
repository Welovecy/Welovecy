import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { busRoutesAt, getBusStop } from "@/lib/data";
import { Crumbs } from "@/components/Bits";
import { BusSource, RouteRow } from "@/components/Buses";
import { AroundBlock } from "@/components/AroundBlock";
import { FromBase } from "@/components/FromBase";
import { directionsTo } from "@/lib/geo";

type P = { params: Promise<{ id: string }> };
/** 4,800 stops: each page renders on first visit, then stays cached. */
export const dynamicParams = true;
export function generateStaticParams() { return []; }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const s = getBusStop((await params).id);
  return s ? { title: `${s.n} bus stop`, description: `Bus routes that call at ${s.n}, with directions and what's nearby.`, robots: { index: false } } : {};
}

export default async function BusStopPage({ params }: P) {
  const s = getBusStop((await params).id);
  if (!s) notFound();
  const routes = busRoutesAt(s.rk);
  return (
    <>
      <div className="wrap">
        <Crumbs items={[["Home", "/"], ["Buses", "/buses"], [s.n]]} />
        <div className="around-head">
          <p className="eyebrow">Bus stop{s.g && s.g !== s.n ? ` · ${s.g}` : ""}</p>
          <h1>{s.n}</h1>
          <FromBase ll={s.ll} />
          <div className="actions">
            <a className="btn btn-primary" href={directionsTo(s.ll)} target="_blank" rel="noopener noreferrer">Walking directions</a>
            <Link className="btn btn-ghost" href="/buses">All routes</Link>
          </div>
        </div>
      </div>
      <section className="wrap" aria-labelledby="h-routes">
        <h2 id="h-routes" style={{ fontSize: 28, marginBottom: 8 }}>Routes from this stop</h2>
        <div>{routes.map((r) => <RouteRow key={r.a + r.r} r={r} />)}</div>
        <BusSource />
      </section>
      <AroundBlock ll={s.ll} skip={s.i} title="Near this stop" />
    </>
  );
}
