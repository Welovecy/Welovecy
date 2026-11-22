import Link from "next/link";
import type { DestId } from "@/lib/types";
import { placeRow, placesFor, poiRow, poisFor } from "@/lib/views";
import { photoFor } from "@/lib/data";
import { PlaceCard } from "./Cards";
import { ListRow } from "./ListRow";

/** Our written places as cards, then every other official record for the area as rows. */
export function ListingSection({ dest, kind, title, id, moreTitle, limit, viewAll }: { dest: DestId; kind: "beach" | "sight"; title: string; id: string; moreTitle?: string; limit?: number; viewAll?: string }) {
  const all = placesFor(dest, kind);
  // photo cards for places with a photo, tidy rows for the rest
  const places = all.filter((p) => photoFor(`place-${p.slug}`));
  const rows = all.filter((p) => !photoFor(`place-${p.slug}`));
  const rowCap = limit ? Math.max(0, limit - places.length) : Infinity;
  const shownRows = rows.slice(0, rowCap);
  const shownPois = poisFor(dest, kind === "beach" ? ["beach"] : ["sight", "family"]).slice(0, Math.max(0, rowCap - shownRows.length));
  const pois = poisFor(dest, kind === "beach" ? ["beach"] : ["sight", "family"]);
  if (!all.length && !pois.length) return null;
  return (
    <section className="wrap" id={id} aria-labelledby={`h-${id}`}>
      <div className="sec-head">
        <h2 id={`h-${id}`}>{title}</h2>
        {viewAll ? <Link href={viewAll}>View all</Link> : kind === "beach" ? <Link href="/beaches">Every beach, with filters</Link> : null}
      </div>
      {places.length ? <div className="grid">{places.map((p) => <PlaceCard key={p.slug} p={p} />)}</div> : null}
      {shownRows.length || shownPois.length ? (
        <div className="near-group" style={{ marginTop: places.length ? 28 : 0 }}>
          {places.length ? <h3 style={{ fontSize: 20 }}>{moreTitle || (kind === "beach" ? "More beaches" : "More to see")}</h3> : null}
          <ul className="rows">
            {shownRows.map((p) => <ListRow key={p.slug} {...placeRow(p)} save />)}
            {shownPois.map((r) => <ListRow key={r.i} {...poiRow(r)} />)}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
