import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/Bits";
import { AIRPORTS, DIST_SOURCE, DPLACES, POPULAR, between, fmtMin, nearestAirport, placeName, slugOf } from "@/lib/distances";

export const metadata: Metadata = {
  title: "Cyprus distances: airports, resorts and towns",
  description: "How far is everything in Cyprus? Driving distances and times from Larnaca and Paphos airports to every resort, and between all the main towns.",
};

export default function DistancesPage() {
  const cols = DPLACES.filter((p) => p.id !== "lca" && p.id !== "pfo");
  return (
    <>
      <PageHead title="How far is it?" lead="Driving distances and times from both airports to every resort, and between the main towns." crumbs={[["Home", "/"], ["Guides", "/guides"], ["Distances"]]} />
      <section className="wrap" aria-labelledby="h-air">
        <div className="sec-head"><h2 id="h-air">From the airports</h2></div>
        <div className="g-table">
          <table>
            <thead><tr><th>Going to</th><th>Larnaca Airport</th><th>Paphos Airport</th><th>Nearest</th></tr></thead>
            <tbody>
              {POPULAR.map((id) => {
                const l = between("lca", id)!, p = between("pfo", id)!, n = nearestAirport(id);
                return (
                  <tr key={id}>
                    <td><strong>{placeName(id)}</strong></td>
                    <td><Link href={`/distances/larnaca-airport-to-${slugOf(id)}`}>{l.km} km<br />{fmtMin(l.min)}</Link></td>
                    <td><Link href={`/distances/paphos-airport-to-${slugOf(id)}`}>{p.km} km<br />{fmtMin(p.min)}</Link></td>
                    <td>{n.name.replace(" Airport", "")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className="wrap" aria-labelledby="h-all">
        <div className="sec-head"><h2 id="h-all">Between towns and resorts</h2></div>
        <p className="muted small" style={{ marginBottom: 12 }}>Kilometres by road. Scroll sideways on a phone.</p>
        <div className="g-table dist-matrix">
          <table>
            <thead><tr><th></th>{cols.map((c) => <th key={c.id}>{c.name.replace(" (Kato Paphos)", "")}</th>)}</tr></thead>
            <tbody>
              {cols.map((r) => (
                <tr key={r.id}><th scope="row">{r.name.replace(" (Kato Paphos)", "")}</th>{cols.map((c) => <td key={c.id}>{r.id === c.id ? "" : between(r.id, c.id)!.km}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted small" style={{ marginTop: 16, maxWidth: 760 }}>
          Distances and times are worked out from <a href={DIST_SOURCE.u} target="_blank" rel="noopener noreferrer">OpenStreetMap</a> road data, from the centre of each place. Times include a margin, but traffic, summer crowds and mountain roads can add more. {AIRPORTS.length ? "" : ""}
        </p>
      </section>
    </>
  );
}
