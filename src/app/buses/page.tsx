import type { Metadata } from "next";
import { BUS } from "@/lib/data";
import { PageHead } from "@/components/Bits";
import { BusSource, RouteRow } from "@/components/Buses";

export const metadata: Metadata = { title: "Buses", description: "Every scheduled bus route in the Republic of Cyprus, plus buses and shuttles to Larnaca and Paphos airports." };

const AREAS = ["Ayia Napa, Protaras and Paralimni", "Paphos", "Limassol", "Larnaca", "Nicosia", "Intercity"];

export default function Buses() {
  const routes = Object.values(BUS.routes);
  const shuttles = BUS.airport.filter((a) => a.type !== "Public bus");
  return (
    <>
      <PageHead title="Buses" lead="Every scheduled route, area by area. Open any hotel or beach to see the stops and routes nearest to it." crumbs={[["Home", "/"], ["Buses"]]} />
      <section className="wrap pad-top" id="airport" aria-labelledby="h-air">
        <h2 id="h-air" className="h-sub">To and from the airports</h2>
        <h3 style={{ fontSize: 20, margin: "8px 0" }}>Public buses</h3>
        <div>{routes.filter((r) => r.air).sort((a, b) => a.r.localeCompare(b.r, "en", { numeric: true })).map((r) => <RouteRow key={r.a + r.r} r={r} />)}</div>
        <h3 style={{ fontSize: 20, margin: "24px 0 8px" }}>Airport shuttles</h3>
        <ul className="rows">
          {shuttles.map((s) => (
            <li key={s.op + s.route}>
              <div className="row" style={{ cursor: "default" }}>
                <span className="mono" aria-hidden="true">{s.air.split(";")[0]}</span>
                <span className="rowtxt">
                  <strong>{s.route}</strong>
                  <span>{s.op}{s.change.startsWith("Yes") ? " · change needed" : ""} · {s.board}</span>
                  <span>{s.ph}{s.web ? <> · <a href={s.web} target="_blank" rel="noopener noreferrer">Times and booking</a></> : null}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
        <p className="tag" style={{ marginTop: 8 }}>Shuttles are private services with their own tickets. Check the operator&apos;s site for your travel date.</p>
      </section>
      {AREAS.map((a) => {
        const list = routes.filter((r) => r.a === a).sort((x, y) => x.r.localeCompare(y.r, "en", { numeric: true }));
        if (!list.length) return null;
        const id = "a-" + a.toLowerCase().replace(/[^a-z]+/g, "-");
        return (
          <section key={a} className="wrap" id={id} aria-labelledby={`h-${id}`}>
            <h2 id={`h-${id}`} className="h-sub">{a} <span className="muted" style={{ fontSize: 18 }}>{list.length} routes</span></h2>
            <div>{list.map((r) => <RouteRow key={r.a + r.r} r={r} />)}</div>
          </section>
        );
      })}
      <section className="wrap"><BusSource /></section>
    </>
  );
}
