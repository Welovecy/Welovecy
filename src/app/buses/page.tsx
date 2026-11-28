import type { Metadata } from "next";
import Link from "next/link";
import { BUS } from "@/lib/data";
import { AppHead } from "@/components/Bits";
import { RouteRow } from "@/components/Buses";
import { BusFinder, type LiteRoute } from "@/components/BusFinder";

export const metadata: Metadata = { title: "Buses", description: "Every scheduled bus route in the Republic of Cyprus, plus buses and shuttles to Larnaca and Paphos airports." };

const AREAS = ["Ayia Napa, Protaras and Paralimni", "Paphos", "Limassol", "Larnaca", "Nicosia", "Intercity"];
const byNum = (a: { r: string }, b: { r: string }) => a.r.localeCompare(b.r, "en", { numeric: true });

export default function Buses() {
  const routes = Object.values(BUS.routes);
  const shuttles = BUS.airport.filter((a) => a.type !== "Public bus");
  const lite: LiteRoute[] = routes.filter((r) => AREAS.includes(r.a)).sort(byNum).map((r) => ({
    k: r.a + r.r, r: r.r, a: r.a, op: r.op, l: r.l, to: r.to.slice(0, 3).join(" or "), air: r.air, web: r.web || BUS.ops[r.op]?.web || null,
    q: [r.r, r.l, r.gl, ...r.to, ...r.from, r.a].join(" ").toLowerCase(),
  }));
  return (
    <div className="app-page">
      <AppHead title="Buses" crumbs={[["Home", "/"], ["Buses"]]} />
      <div className="wrap bus-wrap">
        <Link href="/around" className="bus-tip">
          <span className="bus-tip-ic" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /></svg>
          </span>
          <span><b>Buses near your hotel</b><small>Pick where you&apos;re staying to see the closest stops and where they go</small></span>
          <span className="chev" aria-hidden="true">›</span>
        </Link>

        <section id="airport" aria-labelledby="h-air" className="bus-air">
          <h2 id="h-air" className="sheet-h">To and from the airports</h2>
          {(["LCA", "PFO"] as const).map((code) => {
            const list = routes.filter((r) => r.air === code).sort(byNum);
            return (
              <details key={code} className="bus-card">
                <summary>
                  <span><b>{code === "LCA" ? "Larnaca Airport" : "Paphos Airport"}</b><small>Public buses {list.map((r) => r.r).join(", ")}</small></span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                </summary>
                <div>{list.map((r) => <RouteRow key={r.a + r.r} r={r} />)}</div>
              </details>
            );
          })}
          <details className="bus-card">
            <summary>
              <span><b>Airport shuttles</b><small>{shuttles.length} private services with their own tickets</small></span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </summary>
            <ul className="rows rows-flat">
              {shuttles.map((s) => (
                <li key={s.op + s.route}>
                  <div className="row" style={{ cursor: "default" }}>
                    <span className="busnum" aria-hidden="true">{s.air.split(";")[0]}</span>
                    <span className="rowtxt">
                      <strong>{s.route}</strong>
                      <span>{s.op}{s.change.startsWith("Yes") ? " · change needed" : ""} · {s.board}</span>
                      <span>{s.ph}{s.web ? <> · <a href={s.web} target="_blank" rel="noopener noreferrer">Times and booking</a></> : null}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="hint">Check the operator&apos;s site for your travel date.</p>
          </details>
        </section>

        <section aria-labelledby="h-routes">
          <h2 id="h-routes" className="sheet-h">Every route</h2>
          <BusFinder routes={lite} areas={AREAS} />
        </section>
        <p className="hint">Routes from <a href={BUS.source.u} target="_blank" rel="noopener noreferrer">{BUS.source.t}</a>. Times change by season, so check the timetable before you travel.</p>
      </div>
    </div>
  );
}
