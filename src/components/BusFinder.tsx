"use client";
import { useMemo, useState } from "react";

export interface LiteRoute { k: string; r: string; a: string; op: string; l: string; to: string; air: string | null; web: string | null; q: string }

const AIRPORT: Record<string, string> = { LCA: "Larnaca Airport", PFO: "Paphos Airport" };
const SHORT: Record<string, string> = { "Ayia Napa, Protaras and Paralimni": "Ayia Napa & Protaras", Intercity: "Between towns" };
const FOLD = 12;

function Row({ r }: { r: LiteRoute }) {
  return (
    <div className="busroute">
      <span className="busnum">{r.r}</span>
      <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
        <p><strong>{r.l}</strong>{r.air ? <span className="flag flag-accent" style={{ marginLeft: 8 }}>{AIRPORT[r.air] ?? r.air}</span> : null}</p>
        {r.to ? <p className="meta">Towards {r.to}</p> : null}
        <p className="meta">{r.op}{r.web ? <> · <a href={r.web} target="_blank" rel="noopener noreferrer">Timetable</a></> : null}</p>
      </div>
    </div>
  );
}

/** Pick an area or type a place or number. Every route stays in the page (search engines see them all); the rest are just hidden. */
export function BusFinder({ routes, areas }: { routes: LiteRoute[]; areas: string[] }) {
  const [area, setArea] = useState(areas[0]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const term = q.trim().toLowerCase();
  const hits = useMemo(() => (term.length >= 2 || /^\d/.test(term) ? routes.filter((r) => (/^\d+$/.test(term) ? r.r.startsWith(term) : r.q.includes(term))) : null), [term, routes]);
  return (
    <div className="busfind">
      <label className="bus-search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4" /></svg>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Number or place, like 101" aria-label="Find a bus route by number or place" inputMode="search" enterKeyHint="search" />
        {q ? <button type="button" className="linkbtn" onClick={() => setQ("")}>Clear</button> : null}
      </label>
      {hits ? (
        <section aria-live="polite">
          <p className="bus-count">{hits.length ? `${hits.length} ${hits.length === 1 ? "route" : "routes"}` : "No routes match. Try a town, like Paralimni or Kato Paphos."}</p>
          <div>{hits.slice(0, 40).map((r) => <Row key={r.k} r={r} />)}</div>
        </section>
      ) : null}
      <div hidden={!!hits}>
        <div className="bus-areas" role="tablist" aria-label="Area">
          {areas.map((a) => <button key={a} type="button" role="tab" className="chip" aria-selected={a === area} onClick={() => setArea(a)}>{SHORT[a] ?? a}</button>)}
        </div>
        {areas.map((a) => {
          const list = routes.filter((r) => r.a === a);
          const all = open[a] || list.length <= FOLD + 2;
          return (
            <section key={a} role="tabpanel" hidden={a !== area} aria-label={a}>
              <p className="bus-count">{list.length} routes</p>
              {list.map((r, i) => <div key={r.k} hidden={!all && i >= FOLD}><Row r={r} /></div>)}
              {!all ? <button type="button" className="btn btn-ghost wide" onClick={() => setOpen({ ...open, [a]: true })}>Show all {list.length} routes</button> : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
