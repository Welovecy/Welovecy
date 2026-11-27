import { cardImg } from "./Rail";
import Link from "next/link";
import type { Destination, Profile } from "@/lib/types";
import { getPlace, getPoi, photoFor, placeHref, listingHref } from "@/lib/data";
import { placeRow, poiRow } from "@/lib/views";
import { PlaceCard } from "./Cards";
import { ListRow } from "./ListRow";
import { Sources } from "./Bits";

/** "place:slug" or "poi:id" into something we can show. */
export function resolveRef(ref: string) {
  const [t, id] = ref.split(":");
  if (t === "place") { const p = getPlace(id); return p ? { kind: "place" as const, p, href: placeHref(p.slug), name: p.name } : null; }
  if (t === "poi") { const r = getPoi(id); return r ? { kind: "poi" as const, r, href: listingHref(r.i), name: r.n } : null; }
  return null;
}

export function LocalityChooser({ d, profile, current }: { d: Destination; profile: Profile; current?: string }) {
  const main = profile.localities.filter((l) => !l.nearby);
  const near = profile.localities.filter((l) => l.nearby);
  return (
    <nav className="chooser" aria-label={`Areas of ${d.name}`}>
      <div className="chips">
        {main.map((l) => <Link key={l.slug} className="chip stay-chip" href={`/destinations/${d.id}/${l.slug}`} aria-current={current === l.slug ? "page" : undefined}>{l.title}</Link>)}
      </div>
      {near.length ? (
        <div className="chips" style={{ marginTop: 8 }}>
          <span className="muted small" style={{ alignSelf: "center", marginRight: 4 }}>Nearby</span>
          {near.map((l) => <Link key={l.slug} className="chip stay-chip" href={`/destinations/${d.id}/${l.slug}`} aria-current={current === l.slug ? "page" : undefined}>{l.title}</Link>)}
        </div>
      ) : null}
    </nav>
  );
}

export function StartHere({ items }: { items: [string, string][] }) {
  const res = items.map(([ref, why]) => ({ x: resolveRef(ref), why })).filter((i) => i.x);
  const cards = res.filter((i) => i.x!.kind === "place" && photoFor(`place-${(i.x as { p: { slug: string } }).p.slug}`));
  const rows = res.filter((i) => !cards.includes(i));
  return (
    <>
      {cards.length ? (
        <div className="bx-rail rail-tall">
          {cards.map(({ x, why }) => { if (x!.kind !== "place") return null; const ph = photoFor(`place-${x!.p.slug}`)!; return (
            <Link key={x!.href} href={x!.href} className="bx-pic">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cardImg(ph.u)} alt={ph.t} loading="lazy" decoding="async" />
              <span className="bx-pic-txt"><b>{x!.p.name}</b><small>{why}</small></span>
            </Link>
          ); })}
        </div>
      ) : null}
      {rows.length ? (
        <ul className="rows" style={{ marginTop: cards.length ? 16 : 0 }}>
          {rows.map(({ x, why }) => x!.kind === "place"
            ? <ListRow key={x!.href} {...placeRow(x!.p)} sub={why} save />
            : <ListRow key={x!.href} {...poiRow(x!.r)} sub={why} save />)}
        </ul>
      ) : null}
    </>
  );
}

export function PlanVisit({ d, profile, operator }: { d: Destination; profile: Profile; operator: { t: string; u: string } }) {
  return (
    <section className="wrap" id="s-plan" aria-labelledby="h-plan">
      <h2 id="h-plan" className="h-sub">Plan your visit</h2>
      <div className="plan-grid">
        <div className="panel">
          <h3 style={{ fontSize: 20 }}>Getting around</h3>
          <p style={{ margin: 0 }}>{profile.travel}</p>
          <p className="small" style={{ margin: 0 }}><Link href="/buses">Bus routes and stops</Link> · <a href={operator.u} target="_blank" rel="noopener noreferrer">{operator.t} timetables</a></p>
        </div>
        <div className="panel">
          <h3 style={{ fontSize: 20 }}>A day that fits</h3>
          <p style={{ margin: 0 }}>{profile.day}</p>
        </div>
        <div className="panel">
          <h3 style={{ fontSize: 20 }}>Essentials</h3>
          <p style={{ margin: 0 }}>Pharmacies, clinics and supermarkets, plus emergency numbers.</p>
          <p className="small" style={{ margin: 0 }}><Link href={`/eat-drink/${d.id}`}>Eat and drink in {d.name}</Link> · <Link href={`/essentials/${d.id}/pharmacy`}>Essentials in {d.name}</Link> · <Link href="/pharmacies-on-duty">Pharmacies on duty tonight</Link> · <Link href="/practical#emergency">Help numbers</Link></p>
        </div>
      </div>
      <h3 style={{ fontSize: 22, margin: "32px 0 8px" }}>Questions people ask</h3>
      <div className="faqs">
        {profile.faqs.map(([q, a]) => (
          <details key={q} className="faq"><summary>{q}</summary><p>{a}</p></details>
        ))}
      </div>
      <Sources list={profile.sources} reviewed="destination profile, 22 November 2026" />
    </section>
  );
}
