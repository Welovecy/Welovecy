"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CLIMATE, MON, MONTHS, monthVerdict } from "@/lib/weather";
import type { DestId } from "@/lib/types";

/** "When are you coming?" Pick a month, see every area side by side. */
export function MonthPicker({ areas }: { areas: { id: DestId; name: string }[] }) {
  const [m, setM] = useState(6);
  useEffect(() => { setM(new Date().getMonth()); }, []);
  return (
    <div className="mpick">
      <div className="chips" role="group" aria-label="Month">
        {MON.map((x, i) => (
          <button key={x} type="button" aria-pressed={m === i} className="chip" onClick={() => setM(i)}>{x}</button>
        ))}
      </div>
      <h3 className="mpick-h">{MONTHS[m]} in Cyprus</h3>
      <ul className="mpick-list">
        {areas.map((a) => {
          const c = CLIMATE[a.id];
          return (
            <li key={a.id}>
              <Link href={`/destinations/${a.id}#s-weather`} className="mpick-row">
                <span className="mpick-n"><strong>{a.name}</strong><span>{monthVerdict(c, m)}</span></span>
                <span className="mpick-v"><b>{Math.round(c.hi[m])}°</b><small>day</small></span>
                <span className="mpick-v"><b>{Math.round(c.lo[m])}°</b><small>night</small></span>
                <span className="mpick-v">{c.sea ? <><b>{c.sea[m]}°</b><small>sea</small></> : <><b>–</b><small>inland</small></>}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
