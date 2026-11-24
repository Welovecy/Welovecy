"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { LL } from "@/lib/types";
import { WALK_MAX_KM, driveMinutes, fmtD, km, walkMinutes } from "@/lib/geo";
import { GoIcon } from "./Icons";

export interface GoingRow { i: string; n: string; sub: string; href: string; dir: string; ll?: LL; approx?: boolean }
interface Origin { id: string; label: string; ll: LL }

function far(d: number, approx?: boolean) {
  const a = approx ? "about " : "";
  return d <= WALK_MAX_KM ? `${a}${fmtD(d)} · ${walkMinutes(d)} min walk` : `${a}${fmtD(d)} · ${driveMinutes(d)} min drive`;
}

const STEP = 40;

/** A list of venues sorted by distance from a chosen point: the area centre, a neighbourhood or the visitor. */
export function GoingList({ rows, origins, mono, color }: { rows: GoingRow[]; origins: Origin[]; mono: string; color: string }) {
  const [from, setFrom] = useState(origins[0]);
  const [me, setMe] = useState<"idle" | "busy" | "denied">("idle");
  const [shown, setShown] = useState(STEP);
  const sorted = useMemo(() => {
    const withD = rows.map((r) => ({ r, d: r.ll ? km(from.ll, r.ll) : null }));
    return withD.sort((a, b) => (a.d ?? 1e9) - (b.d ?? 1e9) || a.r.n.localeCompare(b.r.n));
  }, [rows, from]);
  const locate = () => {
    if (!navigator.geolocation) { setMe("denied"); return; }
    setMe("busy");
    navigator.geolocation.getCurrentPosition(
      (p) => { setFrom({ id: "me", label: "you", ll: [p.coords.latitude, p.coords.longitude] }); setMe("idle"); },
      () => setMe("denied"), { timeout: 10000, maximumAge: 300000 },
    );
  };
  const mapped = sorted.filter((x) => x.d !== null);
  const unmapped = sorted.filter((x) => x.d === null);
  return (
    <>
      <div className="going-from" role="group" aria-label="Measure distances from">
        <span className="tag">Distances from</span>
        <div className="chips">
          {origins.map((o) => (
            <button key={o.id} type="button" className="chip stay-chip" aria-pressed={from.id === o.id} onClick={() => { setFrom(o); setShown(STEP); }}>{o.label}</button>
          ))}
          <button type="button" className="chip stay-chip" aria-pressed={from.id === "me"} onClick={locate} disabled={me === "busy"}>
            {me === "busy" ? "Finding you…" : "Where I am"}
          </button>
        </div>
        {me === "denied" ? <span className="tag">Location isn&apos;t available, so distances stay from {from.label}.</span> : null}
      </div>
      <ul className="rows" style={{ maxWidth: 760 }}>
        {mapped.slice(0, shown).map(({ r, d }) => (
          <li key={r.i}>
            <Link className="row" href={r.href}>
              <span className="mono k" aria-hidden="true" style={{ background: color }}>{mono}</span>
              <span className="rowtxt"><strong>{r.n}</strong><span>{[far(d!, r.approx), r.sub].filter(Boolean).join(" · ")}</span></span>
            </Link>
            <a className="dirlink" href={r.dir} target="_blank" rel="noopener noreferrer" aria-label={`Directions to ${r.n}`}><GoIcon /></a>
          </li>
        ))}
      </ul>
      {mapped.length > shown ? (
        <button type="button" className="btn btn-ghost" style={{ marginTop: 14 }} onClick={() => setShown((s) => s + STEP)}>
          Show {Math.min(STEP, mapped.length - shown)} more of {mapped.length - shown}
        </button>
      ) : null}
      {unmapped.length ? (
        <details className="going-unmapped">
          <summary>{unmapped.length} more not on the map yet</summary>
          <ul className="rows" style={{ maxWidth: 760 }}>
            {unmapped.map(({ r }) => (
              <li key={r.i}>
                <Link className="row" href={r.href}>
                  <span className="mono k" aria-hidden="true" style={{ background: color }}>{mono}</span>
                  <span className="rowtxt"><strong>{r.n}</strong><span>{r.sub}</span></span>
                </Link>
                <a className="dirlink" href={r.dir} target="_blank" rel="noopener noreferrer" aria-label={`Directions to ${r.n}`}><GoIcon /></a>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </>
  );
}
