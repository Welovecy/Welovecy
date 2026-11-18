import Link from "next/link";
import type { DestId } from "@/lib/types";
import { placesFor, poiRow, poisFor } from "@/lib/views";
import { PlaceCard } from "./Cards";
import { ListRow } from "./ListRow";

/** Our written places as cards, then every other official record for the area as rows. */
export function ListingSection({ dest, kind, title, id, moreTitle }: { dest: DestId; kind: "beach" | "sight"; title: string; id: string; moreTitle?: string }) {
  const places = placesFor(dest, kind);
  const pois = poisFor(dest, kind === "beach" ? ["beach"] : ["sight", "family"]);
  if (!places.length && !pois.length) return null;
  return (
    <section className="wrap" id={id} aria-labelledby={`h-${id}`}>
      <div className="sec-head">
        <h2 id={`h-${id}`}>{title}</h2>
        {kind === "beach" ? <Link href="/beaches">Every beach, with filters</Link> : null}
      </div>
      {places.length ? <div className="grid">{places.map((p) => <PlaceCard key={p.slug} p={p} />)}</div> : null}
      {pois.length ? (
        <div className="near-group" style={{ marginTop: places.length ? 28 : 0 }}>
          {places.length ? <h3 style={{ fontSize: 20 }}>{moreTitle || (kind === "beach" ? "More beaches" : "More to see")}</h3> : null}
          <ul className="rows">{pois.map((r) => <ListRow key={r.i} {...poiRow(r)} />)}</ul>
        </div>
      ) : null}
    </section>
  );
}
