"use client";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useBase } from "@/lib/store";
import { useWeather } from "./Weather";
import { symbolInfo } from "@/lib/weather";
import { openAphrodite } from "./Ask";
import { EMAIL_BUSINESS } from "@/lib/site";
import type { DestId } from "@/lib/types";
import { DISTRICT_LABEL, DISTRICT_OF, TYPE_LABEL, cyToday, eventMap, overlaps, whenText, type CyEvent, type District, type EventType } from "@/lib/events";

/* ---------- Tabs ---------- */
export function ExploreTabs({ on }: { on: "places" | "events" | "festivals" }) {
  const tabs: [typeof on, string, string][] = [["places", "Places", "/explore"], ["events", "Events", "/explore/events"], ["festivals", "Festivals", "/explore/festivals"]];
  return (
    <nav className="ex-tabs" aria-label="Explore">
      {tabs.map(([k, label, href]) => (
        <Link key={k} href={href} className="ex-tab" aria-current={on === k ? "page" : undefined} scroll={false}>{label}</Link>
      ))}
    </nav>
  );
}

/* ---------- Icon tiles ---------- */
const TILE: Record<string, ReactNode> = {
  beach: <><path d="M12 4a8 8 0 0 1 8 8H4a8 8 0 0 1 8-8z" /><path d="M12 12l3 8" /><path d="M3 21c2-1 4-1 6 0s4 1 6 0 4-1 6 0" /></>,
  village: <><path d="M3 20V12l5-4 5 4v8" /><path d="M13 20v-6l4-3 4 3v6" /><path d="M7 20v-4h2v4M2 20h20" /></>,
  family: <><circle cx="8" cy="7" r="3" /><circle cx="17" cy="9" r="2.4" /><path d="M2.5 20a5.5 5.5 0 0 1 11 0M13 20a4 4 0 0 1 8 0" /></>,
  sight: <><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="3.5" /></>,
};
export function Tiles() {
  const t: [string, string, string, string][] = [
    ["beach", "Beaches", "/beaches", "var(--k-beach)"], ["village", "Villages", "/things/villages", "var(--sun)"],
    ["family", "Family days", "/things/family", "var(--k-bus)"], ["sight", "Must-see", "/must-see", "var(--k-sight)"],
  ];
  return (
    <nav className="ex-tiles" aria-label="Quick picks">
      {t.map(([k, label, href, c]) => (
        <Link key={k} href={href} className="ex-tile">
          <span className="ex-tile-ic" style={{ color: c }}>
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{TILE[k]}</svg>
          </span>
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

/* ---------- This weekend ---------- */
const AREA_NAME: Partial<Record<DestId, string>> = { ayianapa: "Ayia Napa", protaras: "Protaras", paphos: "Paphos", akamas: "Akamas", limassol: "Limassol", larnaca: "Larnaca", nicosia: "Nicosia", troodos: "Troodos" };

function WeekendWeather({ d, days }: { d: DestId; days: string[] }) {
  const w = useWeather(d);
  const list = w?.days?.filter((x) => days.includes(x.date)) ?? [];
  if (!list.length) return <span className="ex-wk-wx muted">{w === null ? "" : " "}</span>;
  return (
    <span className="ex-wk-wx">
      {list.map((x) => (
        <span key={x.date}><b>{new Date(x.date + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" })}</b> {Math.round(x.hi)}° {symbolInfo(x.sym).label.toLowerCase()}</span>
      ))}
      <span className="muted">in {AREA_NAME[d]}</span>
    </span>
  );
}

export function ThisWeekend({ events, days }: { events: CyEvent[]; days: string[] }) {
  const base = useBase();
  const d = ((base?.area as DestId) || "ayianapa");
  return (
    <section className="ex-sec" aria-labelledby="h-wk">
      <div className="ex-sec-head"><h2 id="h-wk">This weekend</h2><Link href="/explore/events?when=weekend">View events <Arrow /></Link></div>
      <div className="ex-wk">
        <WeekendWeather d={d} days={days} />
        {events.length ? (
          <div className="ex-list">{events.slice(0, 2).map((e) => <EventCard key={e.id} e={e} compact />)}</div>
        ) : (
          <p className="ex-wk-empty">No big events listed for this weekend yet. We&apos;re adding Christmas markets, festivals and live shows now.</p>
        )}
        <button type="button" className="ex-ask" onClick={() => openAphrodite(`Plan my weekend${base ? " near my hotel" : ""}`)}>
          <span className="aph-orb" style={{ width: 26, height: 26 }} aria-hidden="true" />
          <span><b>Plan my weekend</b><small>Ask Aphrodite</small></span>
          <Arrow />
        </button>
      </div>
    </section>
  );
}

const Arrow = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;

/* ---------- Event card ---------- */
export function EventCard({ e, compact }: { e: CyEvent; compact?: boolean }) {
  const d = e.start ? new Date(e.start + "T12:00:00Z") : null;
  const map = eventMap(e);
  const onNow = !!e.start && e.start < cyToday() && (e.end ?? e.start) >= cyToday();
  return (
    <article className={`ex-ev${compact ? " is-compact" : ""}`} id={e.id}>
      <div className="ex-ev-date" aria-hidden="true">
        {onNow ? <><b className="ex-now">On</b><span>now</span></> : d ? <><b>{d.getUTCDate()}</b><span>{d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })}</span></> : <><b>TBC</b><span>{e.usual?.match(/January|February|March|April|May|June|July|August|September|October|November|December/)?.[0]?.slice(0, 3) ?? ""}</span></>}
      </div>
      <div className="ex-ev-body">
        <p className="ex-ev-kind">{TYPE_LABEL[e.type]} · {e.town}</p>
        <h3>{e.name}</h3>
        <p className="ex-ev-when">{whenText(e)}{e.time ? ` · ${e.time}` : ""}</p>
        {e.recurrence && !compact && <p className="ex-ev-rec">{e.recurrence}</p>}
        {!compact && <p className="ex-ev-desc">{e.desc}</p>}
        {!compact && (
          <div className="ex-ev-acts">
            {e.start && <a href={`/api/ics/${e.id}`} data-ev="Add to calendar" data-ev-target={e.id}>Add to calendar</a>}
            {map && <a href={map} target="_blank" rel="noopener">Directions</a>}
            {e.guide && <Link href={e.guide}>Our guide</Link>}
            {e.organiserUrl && <a href={e.organiserUrl} target="_blank" rel="noopener">{e.organiser || "Organiser"}</a>}
            {e.ticketUrl && <a href={e.ticketUrl} target="_blank" rel="noopener">Tickets</a>}
          </div>
        )}
        {!compact && <p className="ex-ev-src">Source: <a href={e.source} target="_blank" rel="noopener">{e.sourceName}</a></p>}
      </div>
    </article>
  );
}

/* ---------- Events browser: when and where ---------- */
type When = "all" | "today" | "weekend" | "month" | "dates";
export function EventsBrowser({ events, today, wk, month, types, title }: { events: CyEvent[]; today: string; wk: [string, string]; month: string; types?: EventType[]; title: string }) {
  const [when, setWhen] = useState<When>("all");
  useEffect(() => {
    const w = new URLSearchParams(window.location.search).get("when");
    if (w && ["today", "weekend", "month", "dates"].includes(w)) setWhen(w as When);
  }, []);
  const [area, setArea] = useState<District | "any">("any");
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(month);
  const list = useMemo(() => events.filter((e) => {
    if (types && !types.includes(e.type)) return false;
    if (area !== "any" && e.district !== area && e.district !== "all") return false;
    if (when === "today") return overlaps(e, today, today);
    if (when === "weekend") return overlaps(e, wk[0], wk[1]);
    if (when === "month") return overlaps(e, today, month);
    if (when === "dates") return overlaps(e, from, to || from);
    return true;
  }), [events, types, area, when, today, wk, month, from, to]);

  const chips: [When, string][] = [["all", "All upcoming"], ["today", "Today"], ["weekend", "This weekend"], ["month", "Next 30 days"], ["dates", "Pick dates"]];
  return (
    <div className="ex-browse">
      <div className="ex-chips" role="group" aria-label="When">
        {chips.map(([k, l]) => <button key={k} type="button" aria-pressed={when === k} onClick={() => setWhen(k)}>{l}</button>)}
      </div>
      {when === "dates" && (
        <div className="ex-dates">
          <label>From<input type="date" value={from} min={today} onChange={(e) => setFrom(e.target.value)} /></label>
          <label>To<input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></label>
        </div>
      )}
      <label className="ex-area">
        <span>Area</span>
        <select value={area} onChange={(e) => setArea(e.target.value as District | "any")}>
          <option value="any">All of Cyprus</option>
          {Object.entries(DISTRICT_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </label>
      <h2 className="ex-count">{list.length ? `${list.length} ${title.toLowerCase()}` : `No ${title.toLowerCase()} listed for these dates yet`}</h2>
      <div className="ex-list">{list.map((e) => <EventCard key={e.id} e={e} />)}</div>
      <AddEvent />
    </div>
  );
}

export function AddEvent() {
  return (
    <aside className="ex-add">
      <h3>Running an event in Cyprus?</h3>
      <p>Festivals, markets, live shows, village feasts. Send us the details and a link, and we&apos;ll list it for free.</p>
      <a className="btn btn-primary" href={`mailto:${EMAIL_BUSINESS}?subject=${encodeURIComponent("Event for welovecy.com")}`}>Add your event</a>
      <p className="muted small">Or email <span className="sel">{EMAIL_BUSINESS}</span></p>
    </aside>
  );
}

export { DISTRICT_OF };
