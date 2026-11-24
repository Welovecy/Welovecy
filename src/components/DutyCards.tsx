"use client";
import { useState } from "react";
import Link from "next/link";
import type { LL } from "@/lib/types";

export interface DutyCard {
  key: string; town: string; townGr: string; addr: string; near?: string; ph?: string; href?: string; dir: string;
  ll?: LL; approx?: boolean; dist: string[];
}

function km(a: LL, b: LL) {
  const r = Math.PI / 180, x = (b[1] - a[1]) * r * Math.cos(((a[0] + b[0]) / 2) * r), y = (b[0] - a[0]) * r;
  return Math.sqrt(x * x + y * y) * 6371;
}
const fmt = (d: number) => (d < 1 ? `${Math.round(d * 1000 / 50) * 50} m` : `${d < 10 ? d.toFixed(1) : Math.round(d)} km`);

/** Tonight's duty pharmacies, with an optional "nearest to me" sort that stays on the device. */
export function DutyCards({ items }: { items: DutyCard[] }) {
  const [me, setMe] = useState<LL | null>(null);
  const [state, setState] = useState<"idle" | "busy" | "denied">("idle");
  const list = me ? [...items].sort((a, b) => (a.ll ? km(me, a.ll) : 1e9) - (b.ll ? km(me, b.ll) : 1e9)) : items;
  const locate = () => {
    if (!navigator.geolocation) { setState("denied"); return; }
    setState("busy");
    navigator.geolocation.getCurrentPosition(
      (p) => { setMe([p.coords.latitude, p.coords.longitude]); setState("idle"); },
      () => setState("denied"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };
  return (
    <>
      {items.length > 1 ? (
        <div className="duty-tools">
          <button type="button" className="btn btn-ghost" onClick={locate} disabled={state === "busy"}>
            {state === "busy" ? "Finding you…" : me ? "Sorted by distance from you" : "Sort by distance from me"}
          </button>
          {state === "denied" ? <span className="tag">Location isn&apos;t available. They&apos;re listed by town instead.</span> : null}
        </div>
      ) : null}
      <ol className="duty-list">
        {list.map((x) => (
          <li key={x.key} className="duty-card">
            <div className="duty-top">
              <div>
                <h3>{x.town}</h3>
                <p className="duty-addr" lang="el">{x.addr}, {x.townGr}</p>
                {x.near ? <p className="duty-near" lang="el">{x.near}</p> : null}
              </div>
              {me && x.ll ? <span className="duty-me">{x.approx ? "about " : ""}{fmt(km(me, x.ll))}</span> : null}
            </div>
            {x.dist.length ? <p className="duty-dist">{x.dist.join(" · ")}</p> : null}
            <div className="duty-actions">
              {x.ph ? <a className="btn btn-primary" href={`tel:+357${x.ph}`}>Call {x.ph.replace(/(\d{2})(\d{6})/, "$1 $2")}</a> : null}
              <a className="btn btn-ghost" href={x.dir} target="_blank" rel="noopener noreferrer">Find on map</a>
              {x.href ? <Link className="btn btn-ghost" href={x.href}>Pharmacy details</Link> : null}
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
