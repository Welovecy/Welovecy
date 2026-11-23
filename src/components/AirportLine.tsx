import Link from "next/link";
import { AIRPORTS, DEST_PLACE, between, fmtMin, slugOf } from "@/lib/distances";
import type { DestId } from "@/lib/types";

/** "Getting here": both airports with road distance and drive time, nearest first. */
export function AirportLine({ d, name }: { d: DestId; name: string }) {
  const id = DEST_PLACE[d];
  if (!id) return null;
  const rows = AIRPORTS.map((a) => ({ a, ...between(a.id, id)! })).sort((x, y) => x.min - y.min);
  return (
    <section className="wrap" aria-labelledby="h-getting">
      <div className="sec-head"><h2 id="h-getting">Getting to {name}</h2><Link href="/distances">All distances</Link></div>
      <ul className="air-line">
        {rows.map((r, i) => (
          <li key={r.a.id}>
            <Link href={`/distances/${r.a.slug}-to-${slugOf(id)}`}>
              <span className="muted small">{i === 0 ? "Nearest airport" : "Other airport"}</span>
              <strong>{r.a.name}</strong>
              <span>{r.km} km · about {fmtMin(r.min)} by car</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
