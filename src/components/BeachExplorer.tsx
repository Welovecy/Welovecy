"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { useBase } from "@/lib/store";
import { km, howFar, driveMinutes, walkMinutes, WALK_MAX_KM } from "@/lib/geo";
import { ISLAND_PATH, toMap } from "@/lib/island";

const RATIO = 2;
import { sunTimes, cyTime, windWords, compass } from "@/lib/weather";
import { openAphrodite } from "./Ask";
import { SaveButton } from "./SaveButton";
import type { LL } from "@/lib/types";

export interface Beach {
  href: string; n: string; town: string; area: string; ll: LL; img?: string; alt?: string; dir?: string;
  bf: boolean; lg: boolean; sand: boolean; pebble: boolean; play: boolean; beds: boolean; food: boolean; wheel: boolean;
}
export interface AreaInfo { id: string; name: string; centre: LL; sea: number[] | null }

const MOODS: [keyof Beach, string][] = [
  ["bf", "Blue Flag"], ["sand", "Sandy"], ["lg", "Lifeguards"], ["play", "Kids' playground"],
  ["beds", "Sunbeds"], ["food", "Food and drinks"], ["pebble", "Pebbles"], ["wheel", "Wheelchair access"],
];
const SHOW = 20;

interface Origin { ll: LL; label: string; kind: "hotel" | "me" }
const short = (d: number) => (d <= WALK_MAX_KM ? `${walkMinutes(d)} min walk` : `${driveMinutes(d)} min drive`);

export function BeachExplorer({ beaches, areas, month }: { beaches: Beach[]; areas: AreaInfo[]; month: number }) {
  const base = useBase();
  const [area, setArea] = useState("");
  const [moods, setMoods] = useState<Set<string>>(new Set());
  const [me, setMe] = useState<Origin | null>(null);
  const [locating, setLocating] = useState(false);
  const [locErr, setLocErr] = useState("");
  const [all, setAll] = useState(false);
  const listTop = useRef<HTMLDivElement>(null);

  const origin: Origin | null = me ?? (base ? { ll: base.ll, label: base.n, kind: "hotel" } : null);

  const shown = useMemo(() => {
    const out = beaches.filter((b) => (!area || b.area === area) && [...moods].every((m) => b[m as keyof Beach]));
    const withD = out.map((b) => ({ b, d: origin ? km(origin.ll, b.ll) : null }));
    if (origin) withD.sort((x, y) => x.d! - y.d!);
    return withD;
  }, [beaches, area, moods, origin]);

  const pics = shown.filter((x) => x.b.img).slice(0, 10);
  const areaName = areas.find((a) => a.id === area)?.name;

  const pickArea = (id: string) => { setArea(id); setAll(false); try { track("Beaches area", { area: id || "all" }); } catch {} };
  const toggle = (m: string) => setMoods((s) => { const n = new Set(s); if (n.has(m)) n.delete(m); else n.add(m); return n; });

  function nearMe() {
    if (!("geolocation" in navigator)) { setLocErr("Your browser can't share your location."); return; }
    setLocating(true); setLocErr("");
    navigator.geolocation.getCurrentPosition(
      (p) => { setMe({ ll: [p.coords.latitude, p.coords.longitude], label: "you", kind: "me" }); setArea(""); setLocating(false); try { track("Beaches near me"); } catch {} },
      () => { setLocErr("We couldn't get your location. Check location is allowed for this site."); setLocating(false); },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  // The live strip follows the area you pick, or where you're staying, or the nearest area to you.
  const liveArea = area || nearestArea(origin?.ll, areas) || "larnaca";
  const asks = askFor(areaName, origin);

  return (
    <>
      <LiveStrip area={areas.find((a) => a.id === liveArea)!} month={month} />

      <div className="bx-map-card">
        <IslandMap beaches={shown.map((x) => x.b)} all={beaches} area={area} areas={areas} origin={origin} onArea={pickArea} />
        <div className="bx-scroll" role="group" aria-label="Area">
          <button className="chip" type="button" aria-pressed={!area} onClick={() => pickArea("")}>All of Cyprus</button>
          {areas.map((a) => <button key={a.id} className="chip" type="button" aria-pressed={area === a.id} onClick={() => pickArea(a.id)}>{a.name}</button>)}
        </div>
      </div>

      <div className="bx-origin">
        {origin ? (
          <p>Sorted by distance from <b>{origin.kind === "me" ? "where you are" : origin.label}</b>{me ? <> · <button type="button" className="bx-link" onClick={() => setMe(null)}>{base ? `use ${base.n}` : "clear"}</button></> : null}</p>
        ) : (
          <p>Where are you? See the closest beaches first.</p>
        )}
        <div className="bx-origin-btns">
          <button type="button" className="btn btn-primary bx-near" onClick={nearMe} disabled={locating}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" fill="currentColor" /></svg>
            {locating ? "Finding you…" : "Near me"}
          </button>
          {!base ? <Link className="btn btn-ghost" href="/around">Set my hotel</Link> : null}
        </div>
        {locErr ? <p className="bx-err">{locErr}</p> : null}
      </div>

      <div className="bx-scroll bx-moods" role="group" aria-label="What you want">
        {MOODS.map(([k, label]) => <button key={k} className="chip" type="button" aria-pressed={moods.has(k)} onClick={() => toggle(k)}>{label}</button>)}
      </div>

      {pics.length ? (
        <section aria-labelledby="h-pics" className="bx-sec">
          <h2 id="h-pics" className="bx-h">{origin ? "Closest with a view" : areaName ? `Beaches we love in ${areaName}` : "Beaches we love"}</h2>
          <div className="bx-rail">
            {pics.map(({ b, d }) => (
              <Link key={b.href} href={b.href} className="bx-pic">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.img} alt={b.alt || b.n} loading="lazy" decoding="async" />
                <span className="bx-pic-txt">
                  {d !== null ? <em>{short(d)}</em> : b.bf ? <em>Blue Flag</em> : null}
                  <b>{b.n}</b><small>{b.town}</small>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="bx-ask">
        <span className="bx-ask-who"><span className="aph-face"><img src="/aphrodite-96.webp" alt="" width={28} height={28} /></span>Ask Aphrodite</span>
        <div className="bx-scroll">
          {asks.map((q) => <button key={q} type="button" className="chip bx-ask-q" onClick={() => openAphrodite(q)}>{q}</button>)}
        </div>
      </div>

      <section aria-labelledby="h-all" className="bx-sec" ref={listTop}>
        <h2 id="h-all" className="bx-h">{areaName ?? "Every beach"} <span className="bx-count" aria-live="polite">{shown.length}</span></h2>
        {shown.length ? (
          <ul className="bx-list">
            {(all ? shown : shown.slice(0, SHOW)).map(({ b, d }) => (
              <li key={b.href}>
                <Link href={b.href} className="bx-row">
                  <span className="bx-thumb" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {b.img ? <img src={b.img} alt="" loading="lazy" decoding="async" /> : <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 16c2 0 2-1.5 4-1.5S8 16 10 16s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M2 20c2 0 2-1.5 4-1.5S8 20 10 20s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5" /><circle cx="16" cy="7" r="3" /></svg>}
                  </span>
                  <span className="bx-row-txt">
                    <b>{b.n}</b>
                    <small>{[b.town, b.sand ? "Sand" : b.pebble ? "Pebbles" : null].filter(Boolean).join(" · ")}</small>
                    <span className="bx-tags">
                      {b.bf ? <i className="t-bf">Blue Flag</i> : null}
                      {b.lg ? <i>Lifeguards</i> : null}
                      {b.play ? <i>Playground</i> : null}
                      {b.food ? <i>Food</i> : null}
                    </span>
                  </span>
                  {d !== null ? <span className="bx-dist" title={howFar(d)}>{short(d)}<small>estimate</small></span> : null}
                </Link>
                <SaveButton compact item={{ key: b.href, n: b.n, href: b.href, sub: b.town }} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty"><p>No beaches match all of those. Try fewer filters.</p></div>
        )}
        {!all && shown.length > SHOW ? <button type="button" className="btn btn-ghost bx-more" onClick={() => setAll(true)}>Show all {shown.length}</button> : null}
      </section>
    </>
  );
}

function nearestArea(ll: LL | undefined, areas: AreaInfo[]): string | undefined {
  if (!ll) return undefined;
  let best: AreaInfo | undefined, bd = Infinity;
  for (const a of areas) { const d = km(ll, a.centre); if (d < bd) { bd = d; best = a; } }
  return best?.id;
}

function askFor(areaName: string | undefined, origin: Origin | null): string[] {
  const where = areaName ?? (origin?.kind === "hotel" ? origin.label : null);
  return where
    ? [`Calmest beach near ${where} today?`, `Sandy beach for kids near ${where}?`, `Beach with a taverna near ${where}?`]
    : ["Which beach is calmest today?", "Best sandy beach for kids?", "A quiet beach away from the crowds?"];
}

/* ---------- Live strip: weather now, sea and sunset for the area ---------- */
interface Now { t: number; wind: number; dir: number; sym: string }
const cache = new Map<string, Promise<Now | null>>();
function LiveStrip({ area, month }: { area: AreaInfo; month: number }) {
  const [now, setNow] = useState<Now | null>(null);
  useEffect(() => {
    let on = true;
    if (!cache.has(area.id)) cache.set(area.id, fetch(`/api/weather/${area.id}`).then((r) => (r.ok ? r.json() : null)).catch(() => null));
    cache.get(area.id)!.then((j) => { if (on) setNow(j && typeof j.t === "number" ? j : null); });
    return () => { on = false; };
  }, [area.id]);
  const set = cyTime(sunTimes(new Date(), area.centre).set);
  const sea = area.sea?.[new Date().getMonth()] ?? area.sea?.[month];
  return (
    <div className="bx-live" aria-live="polite">
      <span className="bx-live-dot" aria-hidden="true" />
      <span className="bx-live-where">{area.name} now</span>
      <span>{now ? `${now.t}°` : "…"}</span>
      <span>{now ? `${windWords(now.wind)}${now.wind >= 1.6 ? ` from the ${compass(now.dir)}` : ""}` : "Wind"}</span>
      {sea ? <span suppressHydrationWarning>Sea about {sea}°</span> : null}
      <span suppressHydrationWarning>Sunset {set}</span>
    </div>
  );
}

/* ---------- The island map: tap an area to zoom in ---------- */
function IslandMap({ beaches, all, area, areas, origin, onArea }: { beaches: Beach[]; all: Beach[]; area: string; areas: AreaInfo[]; origin: Origin | null; onArea: (id: string) => void }) {
  const fit = (pts: [number, number][], pad: number): [number, number, number, number] => {
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad, y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
    // keep the map's shape so it doesn't jump in height
    const r = RATIO; let w = x1 - x0, h = y1 - y0;
    if (w / h < r) w = h * r; else h = w / r;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    return [cx - w / 2, cy - h / 2, w, h];
  };
  const full = useMemo(() => fit(all.map((b) => toMap(b.ll)), 6), [all]); // eslint-disable-line react-hooks/exhaustive-deps
  const target = useMemo<[number, number, number, number]>(() => {
    const pts = all.filter((b) => b.area === area).map((b) => toMap(b.ll));
    return area && pts.length ? fit(pts, 8) : full;
  }, [area, all, full]); // eslint-disable-line react-hooks/exhaustive-deps
  const [vb, setVb] = useState(full);
  const cur = useRef(full);
  useEffect(() => {
    const from = cur.current, to = target, t0 = performance.now(), dur = 520;
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      const v = from.map((f, i) => f + (to[i] - f) * e) as [number, number, number, number];
      cur.current = v; setVb(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  const zoom = full[2] / vb[2];
  const tap = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = vb[0] + ((e.clientX - r.left) / r.width) * vb[2], y = vb[1] + ((e.clientY - r.top) / r.height) * vb[3];
    let best = "", bd = Infinity;
    for (const a of areas) { const [ax, ay] = toMap(a.centre); const d = (ax - x) ** 2 + (ay - y) ** 2; if (d < bd) { bd = d; best = a.id; } }
    onArea(area === best ? "" : best);
  };
  const shownSet = new Set(beaches.map((b) => b.href));
  const me = origin ? toMap(origin.ll) : null;
  return (
    <svg className="bx-map" viewBox={vb.join(" ")} onClick={tap} role="img" aria-label={`Map of Cyprus with ${beaches.length} beaches. Tap an area to zoom in.`} preserveAspectRatio="xMidYMid meet">
      <path d={ISLAND_PATH} className="bx-land" strokeWidth={0.5 / zoom} />
      {all.map((b) => { const [x, y] = toMap(b.ll); const on = shownSet.has(b.href); return <circle key={b.href} cx={x} cy={y} r={(on ? 1.5 : 1) / Math.sqrt(zoom)} className={on ? (b.bf ? "bx-dot bf" : "bx-dot") : "bx-dot off"} />; })}
      {me ? <g className="bx-me"><circle cx={me[0]} cy={me[1]} r={3.2 / Math.sqrt(zoom)} /><circle cx={me[0]} cy={me[1]} r={1.6 / Math.sqrt(zoom)} /></g> : null}
    </svg>
  );
}
