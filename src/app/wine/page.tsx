import type { Metadata } from "next";
import { WINE_ROUTES, getDest, getPlace } from "@/lib/data";
import { PageHead, Sources } from "@/components/Bits";
import { ListRow } from "@/components/ListRow";
import { placeRow } from "@/lib/views";
import { searchMaps } from "@/lib/geo";

export const metadata: Metadata = { title: "Wine routes", description: "All seven official Cyprus wine routes, with selected wineries and how to reach them." };

export default function Wine() {
  return (
    <>
      <PageHead title="Wine routes" lead="All seven official wine routes, with wineries worth the drive. Book tastings ahead, and pick a designated driver." crumbs={[["Home", "/"], ["Things to do", "/things"], ["Wine routes"]]} />
      <section className="wrap pad-top">
        <div className="routes-grid">
          {WINE_ROUTES.map((r) => {
            const stops = [...r.wineries, ...(r.places ?? [])].map((s) => getPlace(s)).filter(Boolean);
            return (
              <article key={r.n} className="panel route" aria-labelledby={`w-${r.n}`}>
                <p className="eyebrow">{getDest(r.dest)?.name}</p>
                <h2 id={`w-${r.n}`} style={{ fontSize: 24 }}>{r.n}</h2>
                <p className="muted small" style={{ margin: 0 }}>{r.loc}</p>
                <p style={{ margin: 0 }}>{r.how}</p>
                <div className="before"><span className="label">Before you go</span><p>{r.before}</p></div>
                {stops.length ? <ul className="rows">{stops.map((p) => <ListRow key={p!.slug} {...placeRow(p!)} save />)}</ul> : null}
                <a className="small" href={r.ll ? `https://www.google.com/maps/search/?api=1&query=${r.ll[0]},${r.ll[1]}` : searchMaps(`${r.loc}, Cyprus`)} target="_blank" rel="noopener noreferrer">Open the area in Maps</a>
              </article>
            );
          })}
        </div>
        <Sources list={[{ t: "Visit Cyprus: the seven wine routes", u: "https://www.visitcyprus.com/" }]} reviewed="visitor guide, 22 November 2026" />
      </section>
    </>
  );
}
