import Link from "next/link";
import type { BusRoute, LL } from "@/lib/types";
import { BUS, busRoutesAt, getBusStop, spots } from "@/lib/data";
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

/** Places a guest would recognise, matched in route names. Order here is only for ties. */
const PLACES: [string, RegExp][] = [
  ["Larnaca Airport", /airport|aerodrom/i], ["Ayia Napa", /a[gy]ia napa|ag\. napa/i], ["Protaras", /protara/i], ["Paralimni", /paralimni/i],
  ["Cape Greco", /cape greco|kavo gkreko|cavo greco/i], ["Konnos", /konnos/i], ["Pernera", /pernera/i], ["Kapparis", /kappari/i],
  ["Deryneia", /deryneia/i], ["Sotira", /sotira/i], ["Liopetri", /liopetri/i], ["Xylofagou", /xylofagou/i], ["Larnaca", /larnaca|larnaka/i],
  ["Nicosia", /nicosia|lefkosia/i], ["Limassol", /limassol|lemesos/i], ["Paphos", /paphos|pafos|kato paf/i], ["Coral Bay", /coral bay/i],
  ["Peyia", /pe[gy]ia/i], ["Polis", /\bpolis\b(?! *-? *(chrysochous )?(hospital|health))/i], ["Latchi", /latch?i/i], ["Mackenzie", /mackenzie|makenzy/i], ["Finikoudes", /f[oi]+nikoudes/i],
  ["Pissouri", /pissouri/i], ["Platres", /platres/i], ["Troodos", /troodos/i], ["Lefkara", /lefkara/i], ["Kiti", /\bkiti\b/i],
  ["Mazotos", /mazotos/i], ["Zygi", /\bzygi\b/i], ["Ayia Thekla", /a[gy](ia|\.) thekla/i], ["Waterpark", /waterpark|water park/i],
];

const TOWNS = new Set(["Ayia Napa", "Protaras", "Paralimni", "Larnaca", "Nicosia", "Limassol", "Paphos", "Polis"]);
const SPOTS = new Set(["Cape Greco", "Konnos", "Pernera", "Waterpark", "Coral Bay", "Latchi", "Mackenzie", "Finikoudes", "Kapparis", "Ayia Thekla", "Troodos", "Platres", "Lefkara", "Peyia", "Pissouri"]);

function servedPlaces(routes: BusRoute[], here: string): string[] {
  const count = new Map<string, number>();
  for (const r of routes) {
    const text = [r.l, ...r.to, ...r.from].join(" ");
    for (const [name, rx] of PLACES) {
      if (name === here || (name === "Larnaca Airport" && r.air !== "LCA")) continue;
      if (name === "Larnaca Airport" ? true : rx.test(text)) count.set(name, (count.get(name) || 0) + 1);
    }
    if (r.air === "PFO") count.set("Paphos Airport", (count.get("Paphos Airport") || 0) + 1);
  }
  const tier = (k: string) => (k.endsWith("Airport") ? 0 : TOWNS.has(k) ? 1 : SPOTS.has(k) ? 2 : 3);
  return [...count.entries()].sort((a, b) => tier(a[0]) - tier(b[0]) || b[1] - a[1]).map(([k]) => k).slice(0, 5);
}

function joinWords(list: string[]) {
  return list.length <= 1 ? list.join("") : `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
}

/** Nearest stops in plain words. Route numbers and timetables sit behind "See routes". */
export function BusesNear({ ll, here = "", title = "Buses from here" }: { ll: LL; here?: string; title?: string }) {
  const near = nearestOf(ll, spots(), "bus", 8).filter((n) => n.d <= 1.2);
  // the same stop on both sides of the road counts once
  const groups: { name: string; d: number; ll: LL; keys: string[] }[] = [];
  for (const n of near) {
    const s = getBusStop(n.s.key);
    if (!s) continue;
    const g = groups.find((x) => x.name === s.n && n.d - x.d < 0.15);
    if (g) g.keys = [...new Set([...g.keys, ...s.rk])];
    else groups.push({ name: s.n, d: n.d, ll: s.ll, keys: [...s.rk] });
  }
  return (
    <section className="wrap" id="buses" aria-labelledby="h-buses">
      <h2 id="h-buses" style={{ fontSize: 28, marginBottom: 16 }}>{title}</h2>
      {!groups.length ? (
        <p className="muted">No bus stop within a 15-minute walk. <Link href="/buses">See all routes</Link>.</p>
      ) : (
        <div className="stops">
          {groups.slice(0, 3).map((g) => {
            const routes = busRoutesAt(g.keys);
            const places = servedPlaces(routes, here);
            return (
              <div key={g.name + g.d} className="stop">
                <div className="stop-head">
                  <span className="mono k k-bus" aria-hidden="true" style={{ background: "var(--k-bus)" }}>BUS</span>
                  <div style={{ minWidth: 0 }}>
                    <p className="stop-name">{g.name}</p>
                    <p className="muted small">{howFar(g.d)}</p>
                  </div>
                  <a className="dirlink" href={directionsTo(g.ll)} target="_blank" rel="noopener noreferrer" aria-label={`Walking directions to ${g.name}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M3 11l18-8-8 18-2-8z" /></svg>
                  </a>
                </div>
                {places.length ? <p className="stop-to">Buses to {joinWords(places)}</p> : null}
                <details className="more-routes">
                  <summary>See routes ({routes.length})</summary>
                  <div>{routes.map((r) => <RouteRow key={r.a + r.r} r={r} />)}</div>
                </details>
              </div>
            );
          })}
        </div>
      )}
      <p className="muted small" style={{ marginTop: 14 }}><Link href="/buses">All bus routes and airport transfers</Link></p>
    </section>
  );
}

export { busRoutesAt };
