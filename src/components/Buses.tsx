import Link from "next/link";
import type { BusRoute, LL } from "@/lib/types";
import { BUS, busRoutesAt, busStopHref, getBusStop, spots } from "@/lib/data";
import { nearestOf } from "@/lib/around";
import { directionsTo, howFar } from "@/lib/geo";

const AIRPORT: Record<string, string> = { LCA: "Larnaca Airport", PFO: "Paphos Airport" };

export function RouteRow({ r, stop }: { r: BusRoute; stop?: string }) {
  const web = r.web || BUS.ops[r.op]?.web;
  return (
    <div className="busroute">
      <span className="busnum">{r.r}</span>
      <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
        <p><strong>{r.l}</strong>{r.air ? <span className="flag flag-accent" style={{ marginLeft: 8 }}>{AIRPORT[r.air] ?? r.air}</span> : null}</p>
        {r.to.length ? <p className="meta">Towards {r.to.slice(0, 3).join(" or ")}</p> : null}
        <p className="meta">
          {r.op}{stop ? ` · from ${stop}` : ""}
          {web ? <> · <a href={web} target="_blank" rel="noopener noreferrer">Timetable</a></> : null}
        </p>
      </div>
    </div>
  );
}

export function BusSource() {
  return (
    <p className="tag" style={{ marginTop: 12 }}>
      Scheduled routes, not live times. Bus data:{" "}
      <a href={BUS.source.u} target="_blank" rel="noopener noreferrer">Public Works Department via Motion Bus Card</a>, CC BY 4.0,
      feeds dated 20 November 2026. Routes with no upcoming trips are left out.
    </p>
  );
}

/** Routes that call at the stops nearest a place, each listed once from its closest stop. */
export function BusesNear({ ll, title = "Buses from here" }: { ll: LL; title?: string }) {
  const near = nearestOf(ll, spots(), "bus", 6).filter((n) => n.d <= 1.2);
  if (!near.length) {
    return (
      <section className="wrap" id="buses" aria-labelledby="h-buses" style={{ paddingTop: 24 }}>
        <h2 id="h-buses" style={{ fontSize: 28, marginBottom: 12 }}>{title}</h2>
        <p className="muted">No bus stop within a 15-minute walk. <Link href="/buses">See all routes</Link>.</p>
      </section>
    );
  }
  const seen = new Set<string>();
  const rows: { r: BusRoute; stop: string; key: string; d: number }[] = [];
  for (const n of near) {
    const s = getBusStop(n.s.key);
    if (!s) continue;
    for (const k of s.rk) {
      if (seen.has(k) || !BUS.routes[k]) continue;
      seen.add(k);
      rows.push({ r: BUS.routes[k], stop: `${s.n}, ${howFar(n.d)}`, key: k, d: n.d });
    }
  }
  // closest stop first; at the same stop, airport routes first, then by number
  rows.sort((a, b) => a.d - b.d || (b.r.air ? 1 : 0) - (a.r.air ? 1 : 0) || a.r.r.localeCompare(b.r.r, "en", { numeric: true }));
  return (
    <section className="wrap" id="buses" aria-labelledby="h-buses" style={{ paddingTop: 24 }}>
      <h2 id="h-buses" style={{ fontSize: 28, marginBottom: 12 }}>{title}</h2>
      <div className="near-cols">
        <div className="near-group">
          <h3 style={{ fontSize: 20 }}>Nearest stops</h3>
          <ul className="rows">
            {near.slice(0, 4).map((n) => (
              <li key={n.s.key}>
                <Link className="row" href={busStopHref(n.s.key)}>
                  <span className="mono k k-bus" aria-hidden="true" style={{ background: "var(--k-bus)" }}>BUS</span>
                  <span className="rowtxt"><strong>{n.s.n}</strong><span>{howFar(n.d)} · {n.s.sub}</span></span>
                </Link>
                <a className="dirlink" href={directionsTo(n.s.ll)} target="_blank" rel="noopener noreferrer" aria-label={`Walking directions to ${n.s.n}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M3 11l18-8-8 18-2-8z" /></svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="near-group" style={{ gridColumn: "span 2" }}>
          <h3 style={{ fontSize: 20 }}>Routes</h3>
          <div>{rows.slice(0, 12).map((x) => <RouteRow key={x.key} r={x.r} stop={x.stop} />)}</div>
          {rows.length > 12 ? <p className="muted small">{rows.length - 12} more routes call at these stops.</p> : null}
        </div>
      </div>
      <BusSource />
    </section>
  );
}

export { busRoutesAt };
