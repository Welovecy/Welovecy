import Link from "next/link";
import type { ReactNode } from "react";
import type { Fact, LL, Photo, Source, AroundKind } from "@/lib/types";
import { ISLAND_PATH, toMap } from "@/lib/island";
import { aroundData } from "@/lib/views";
import { driveMinutes, walkMinutes, WALK_MAX_KM, directionsTo } from "@/lib/geo";
import { ESSENTIAL_LABEL, KINDS } from "@/lib/kinds";
import { formatDate } from "@/lib/text";
import { KindIcon } from "./KindIcon";
import { NearbyTabs, type NearItem } from "./DetailClient";

/** Short distance words for cards: "4 min walk" or "12 min drive". */
export const shortFar = (d: number) => (d <= WALK_MAX_KM ? `${walkMinutes(d)} min walk` : `${driveMinutes(d)} min drive`);

/* ---------- Hero: a full-bleed photo, or a small map of where it is ---------- */
export function DetailHero({ photo, ll, tint = "#2E6E8E", eyebrow, title, chips = [], kind }: {
  photo?: Photo; ll?: LL; tint?: string; eyebrow: string; title: string; chips?: string[]; kind?: AroundKind;
}) {
  const chipRow = chips.length ? <div className="dh-chips">{chips.map((c) => <span key={c}>{c}</span>)}</div> : null;
  if (photo) {
    return (
      <header className="dh dh-photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.u} alt={photo.t} fetchPriority="high" decoding="async" />
        <div className="dh-over">
          <div className="wrap">
            <p className="dh-eye">{eyebrow}</p>
            <h1>{title}</h1>
            {chipRow}
          </div>
        </div>
      </header>
    );
  }
  // No photo yet: the coastline around the spot, with a pin. Every page still opens with a sense of place.
  const [x, y] = ll ? toMap(ll) : [0, 0];
  const w = 44, h = 26;
  return (
    <header className="dh dh-map" style={{ ["--tint" as string]: tint }}>
      {ll ? (
        <svg className="dh-mapsvg" viewBox={`${x - w / 2} ${y - h / 2} ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path d={ISLAND_PATH} className="dh-land" />
          <circle cx={x} cy={y} r="2.6" className="dh-pulse" />
          <circle cx={x} cy={y} r="1.05" className="dh-pin" />
        </svg>
      ) : null}
      <div className="dh-body wrap">
        <p className="dh-eye">{kind ? <KindIcon k={kind} size={26} /> : null}{eyebrow}</p>
        <h1>{title}</h1>
        {chipRow}
      </div>
    </header>
  );
}

/* ---------- Details: only what we know, in one calm list ---------- */
const META = new Set(["Map position", "Register number", "Licence"]);
export function InfoList({ rows, title = "Details" }: { rows: Fact[]; title?: string }) {
  const known = rows.filter(([l, , u]) => !u && !META.has(l));
  const unsure = rows.filter(([l, , u]) => u && !META.has(l) && l !== "Status");
  if (!known.length && !unsure.length) return null;
  return (
    <section className="dsec" aria-label={title}>
      <h2 className="dsec-h">{title}</h2>
      {known.length ? (
        <dl className="ilist">
          {known.map(([l, v]) => <div key={l}><dt>{l}</dt><dd>{linkify(l, v)}</dd></div>)}
        </dl>
      ) : null}
      {unsure.length ? (
        <p className="inote">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
          <span>{unsure.map(([l]) => l.toLowerCase()).join(", ").replace(/^./, (c) => c.toUpperCase())} {unsure.length > 1 || /s$/.test(unsure[0][0]) ? "aren't" : "isn't"} confirmed yet. Check with them before you go.</span>
        </p>
      ) : null}
    </section>
  );
}
function linkify(label: string, v: string): ReactNode {
  if (label === "Phone") return v.split(/,\s*/).map((n, i) => <span key={n}>{i ? ", " : ""}<a href={`tel:${/^\+/.test(n) ? n.replace(/\s/g, "") : "+357" + n.replace(/\D/g, "")}`} data-ev="Call">{n}</a></span>);
  if (label === "Email") return <a href={`mailto:${v}`} data-ev="Email">{v}</a>;
  if (label === "Website") return <a href={`https://${v}`} target="_blank" rel="noopener noreferrer" data-ev="Outbound">{v}</a>;
  return v;
}

/* ---------- Beach facilities as a tidy grid ---------- */
const FAC: Record<string, string> = {
  "Lifeguards": "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6Z",
  "Sunbeds and umbrellas": "M12 3a8 8 0 0 0-8 8h16a8 8 0 0 0-8-8ZM12 11v10",
  "Toilets": "M7 4a1.5 1.5 0 1 0 0 .01M17 4a1.5 1.5 0 1 0 0 .01M5 8h4l-1 6v6M15 8h4l1 7h-2v5",
  "Showers": "M4 10a8 8 0 0 1 16 0ZM8 14v1M12 14v3M16 14v1M10 19v1M14 19v1",
  "Changing rooms": "M9 3h6l4 4-3 2v12H8V9L5 7Z",
  "Water sports": "M3 17c2 0 2-2 4.5-2s2.5 2 4.5 2 2.5-2 4.5-2 2.5 2 4.5 2M8 13l8-9 2 7Z",
  "Food and drinks": "M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 1.5-3 4-3 7h3v11",
  "Parking": "M5 21V3h7a5 5 0 0 1 0 10H5",
  "Playground": "M4 21V7l4-4 4 4v14M12 11l8 10M4 13h8",
  "Wheelchair accessible": "M10 4a1.5 1.5 0 1 0 0 .01M10 7v6h6l2 5M14 13a5 5 0 1 1-7.5-4.3",
  "Seatrac": "M3 18c2 0 2-2 4.5-2S10 18 12 18s2.5-2 4.5-2S19 18 21 18M8 14V6h8M16 6v8",
};
export function Facilities({ list }: { list: string[] }) {
  if (!list.length) return null;
  return (
    <section className="dsec" aria-label="Facilities">
      <h2 className="dsec-h">Facilities</h2>
      <ul className="fgrid">
        {list.map((f) => (
          <li key={f}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={FAC[f] ?? "M5 12l4 4 10-10"} /></svg>
            <span>{f === "Sunbeds and umbrellas" ? "Sunbeds" : f === "Wheelchair accessible" ? "Wheelchair access" : f}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- What's around: essentials you can swipe, then the nearest by kind ---------- */
const GROUPS: [AroundKind, string][] = [["beach", "Beaches"], ["sight", "Sights"], ["eat", "Eat & drink"]];
export function Around({ ll, skip, title, moreHref }: { ll: LL; skip?: string; title: string; moreHref: string }) {
  const a = aroundData(ll, skip);
  const ess = a.essentials.filter((e) => e.near);
  const groups = GROUPS.map(([k, label]) => ({
    k, label,
    items: a.near(k as Parameters<typeof a.near>[0], 5).filter((n) => n.d <= 25).map((n): NearItem => ({
      href: n.s.href, n: n.s.n, k: n.s.k, meta: [n.s.sub, (n.s.approx ? "about " : "") + shortFar(n.d)].filter(Boolean).join(" · "),
      dir: n.s.dir || directionsTo(n.s.ll),
    })),
  })).filter((g) => g.items.length);
  return (
    <section className="dsec dsec-wide" aria-labelledby="h-around">
      <div className="dsec-row">
        <h2 id="h-around" className="dsec-h">{title}</h2>
        <Link href={moreHref} className="dlink">Map <span aria-hidden="true">›</span></Link>
      </div>
      {ess.length ? (
        <div className="drail">
          {ess.map(({ kind, near }) => (
            <Link key={kind} href={kind === "bus" ? `${moreHref}#buses` : near!.s.href} className="dess">
              <KindIcon k={kind} size={36} />
              <small>{(ESSENTIAL_LABEL[kind] ?? KINDS[kind].one).replace("Nearest ", "")}</small>
              <b>{near!.s.n}</b>
              <span>{shortFar(near!.d)}</span>
            </Link>
          ))}
        </div>
      ) : null}
      {groups.length ? <NearbyTabs groups={groups} /> : null}
      <p className="dfine">Distances and times are estimates. We&apos;re still mapping some places.</p>
    </section>
  );
}

/* ---------- About this information: sources, review date and the fix-it link, at the very end ---------- */
export function AboutInfo({ sources, reviewed, extra, reportHref, name, more }: {
  sources: Source[]; reviewed?: string; extra?: { title: string; list: Source[]; note?: string }; reportHref: string; name: string; more?: ReactNode;
}) {
  const when = reviewed ? (/^\d{4}-\d{2}-\d{2}$/.test(reviewed) ? formatDate(reviewed) : reviewed) : null;
  return (
    <section className="wrap about-info">
      <details>
        <summary>
          <span>About this information</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </summary>
        <div className="ai-body">
          <p className="ai-h">Sources</p>
          <ul>{sources.map((s) => <li key={s.u + s.t}><a href={s.u} target="_blank" rel="noopener noreferrer">{s.t}</a></li>)}</ul>
          {when ? <p className="ai-note">Last reviewed: {when}</p> : null}
          {extra && extra.list.length ? (
            <>
              <p className="ai-h">{extra.title}</p>
              <ul>{extra.list.map((s) => <li key={s.u + s.t}><a href={s.u} target="_blank" rel="noopener noreferrer">{s.t}</a></li>)}</ul>
              {extra.note ? <p className="ai-note">{extra.note}</p> : null}
            </>
          ) : null}
          {more}
          <p className="ai-fix"><a href={reportHref} data-ev="Map fix" data-ev-target={name}>Something wrong? Tell us</a></p>
        </div>
      </details>
    </section>
  );
}
