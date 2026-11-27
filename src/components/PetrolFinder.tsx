"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { LL } from "@/lib/types";
import { directionsTo, driveMinutes, fmtD, km } from "@/lib/geo";
import { useBase } from "@/lib/store";
import { GoIcon } from "./Icons";

export interface Station { i: string; n: string; ll: LL; brand?: string; h24?: boolean; tw?: string }
interface Origin { id: string; label: string; ll: LL }

/** The nearest petrol stations to you, your hotel or an area, drawn as a bar of driving time. */
export function PetrolFinder({ stations, areas }: { stations: Station[]; areas: Origin[] }) {
  const base = useBase();
  const [pick, setPick] = useState<Origin | null>(null);
  const [me, setMe] = useState<"idle" | "busy" | "denied">("idle");
  const [only24, setOnly24] = useState(false);
  const from: Origin = pick ?? (base ? { id: "base", label: base.n, ll: base.ll } : areas[0]);
  const near = useMemo(() => stations
    .filter((s) => !only24 || s.h24)
    .map((s) => ({ s, d: km(from.ll, s.ll) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 8), [stations, from, only24]);
  const max = Math.max(...near.map((x) => driveMinutes(x.d)), 10);
  const locate = () => {
    if (!navigator.geolocation) { setMe("denied"); return; }
    setMe("busy");
    navigator.geolocation.getCurrentPosition(
      (p) => { setPick({ id: "me", label: "you", ll: [p.coords.latitude, p.coords.longitude] }); setMe("idle"); },
      () => setMe("denied"), { timeout: 10000, maximumAge: 300000 },
    );
  };
  return (
    <div className="petrol">
      <div className="going-from" role="group" aria-label="Measure from">
        <span className="tag">Nearest to</span>
        <div className="chips">
          <button type="button" className="chip stay-chip" aria-pressed={from.id === "me"} onClick={locate} disabled={me === "busy"}>{me === "busy" ? "Finding you…" : "Where I am"}</button>
          {base ? <button type="button" className="chip stay-chip" aria-pressed={from.id === "base"} onClick={() => setPick({ id: "base", label: base.n, ll: base.ll })}>{base.n}</button> : null}
          {areas.map((o) => <button key={o.id} type="button" className="chip stay-chip" aria-pressed={from.id === o.id} onClick={() => setPick(o)}>{o.label}</button>)}
        </div>
        {me === "denied" ? <span className="tag">Location isn&apos;t available, so this shows {from.label}.</span> : null}
        <label className="petrol-24"><input type="checkbox" checked={only24} onChange={(e) => setOnly24(e.target.checked)} /> Open 24 hours only</label>
      </div>
      <p className="petrol-h">{near.length ? `The ${near.length} nearest to ${from.id === "me" ? "you" : from.label}` : "No 24-hour stations mapped near here yet."}</p>
      <ol className="petrol-list">
        {near.map(({ s, d }) => {
          const m = driveMinutes(d);
          return (
            <li key={s.i} className="petrol-row">
              <Link href={`/listing/${encodeURIComponent(s.i)}`} className="petrol-main">
                <span className="petrol-name"><strong>{s.brand ?? "Petrol station"}</strong>{s.tw ? <span>{s.tw}</span> : null}{s.h24 ? <em className="petrol-badge">24h</em> : null}</span>
                <span className="petrol-bar" aria-hidden="true"><i style={{ width: `${Math.max(8, (m / max) * 100)}%` }} /></span>
                <span className="petrol-meta">{fmtD(d)} · {m} min drive</span>
              </Link>
              <a className="dirlink" href={directionsTo(s.ll)} target="_blank" rel="noopener noreferrer" aria-label={`Directions to ${s.n}`}><GoIcon /></a>
            </li>
          );
        })}
      </ol>
      <p className="tag">Driving times are estimates from straight-line distance. Hours from OpenStreetMap, so check before you go.</p>
    </div>
  );
}
