import Link from "next/link";
import type { DestId } from "@/lib/types";
import { placeRow, placesFor, poiRow, poisFor } from "@/lib/views";
import { photoFor } from "@/lib/data";
import { cardImg } from "./Rail";
import Link2 from "next/link";
import { ListRow } from "./ListRow";

/** Our written places as cards, then every other official record for the area as rows. */
export function ListingSection({ dest, kind, title, id, moreTitle, limit, viewAll, skip = [], fold }: { dest: DestId; kind: "beach" | "sight"; title: string; id: string; moreTitle?: string; limit?: number; viewAll?: string; skip?: string[]; /** show this many rows, the rest behind "Show all" (still in the page for search engines) */ fold?: number }) {
  const all = placesFor(dest, kind).filter((p) => !skip.includes(p.slug));
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
      <div className="dsec-row" style={{ marginBottom: 12 }}>
        <h2 id={`h-${id}`} className="dsec-h">{title}</h2>
        {viewAll ? <Link href={viewAll} className="dlink">See all <span aria-hidden="true">›</span></Link> : kind === "beach" ? <Link href="/beaches" className="dlink">Every beach <span aria-hidden="true">›</span></Link> : null}
      </div>
      {places.length ? (
        <div className="bx-rail">
          {places.map((p) => { const ph = photoFor(`place-${p.slug}`)!; return (
            <Link2 key={p.slug} href={`/places/${p.slug}`} className="bx-pic">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cardImg(ph.u)} alt={ph.t} loading="lazy" decoding="async" />
              <span className="bx-pic-txt"><b>{p.name}</b><small>{p.intro}</small></span>
            </Link2>
          ); })}
        </div>
      ) : null}
      {shownRows.length || shownPois.length ? (
        <div className="near-group" style={{ marginTop: places.length ? 28 : 0 }}>
          {places.length ? <h3 style={{ fontSize: 18 }}>{moreTitle || (kind === "beach" ? "More beaches" : "More to see")}</h3> : null}
          {fold && shownRows.length + shownPois.length > fold + 1 ? (() => {
            const all = [...shownRows.map((p) => <ListRow key={p.slug} {...placeRow(p)} save />), ...shownPois.map((r) => <ListRow key={r.i} {...poiRow(r)} />)];
            return (
              <>
                <ul className="rows">{all.slice(0, fold)}</ul>
                <details className="fold">
                  <summary><span>Show all {all.length}</span></summary>
                  <ul className="rows">{all.slice(fold)}</ul>
                </details>
              </>
            );
          })() : (
            <ul className="rows">
              {shownRows.map((p) => <ListRow key={p.slug} {...placeRow(p)} save />)}
              {shownPois.map((r) => <ListRow key={r.i} {...poiRow(r)} />)}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}
