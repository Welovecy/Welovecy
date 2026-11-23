"use client";
import { useEffect, useState } from "react";
import { DEST_CENTRE } from "@/lib/centres";
import type { DestId } from "@/lib/types";
import { compass, cyDay, cyTime, sunTimes, symbolInfo, windWords, type Now } from "@/lib/weather";

type Icon = ReturnType<typeof symbolInfo>["icon"];

export function WeatherIcon({ icon, size = 40 }: { icon: Icon; size?: number }) {
  const sun = <g><circle cx="20" cy="20" r="7" fill="#F2A33A" />{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <line key={a} x1="20" y1="6" x2="20" y2="9.5" stroke="#F2A33A" strokeWidth="2.4" strokeLinecap="round" transform={`rotate(${a} 20 20)`} />)}</g>;
  const moon = <path d="M24 8a12 12 0 1 0 8 19A10 10 0 0 1 24 8z" fill="#C9CEDA" />;
  const cloud = (y = 0, c = "var(--wx-cloud)") => <path d={`M12 ${30 + y}h17a6 6 0 0 0 0-12 8 8 0 0 0-15.4 2A5 5 0 0 0 12 ${30 + y}z`} fill={c} />;
  const drops = <g stroke="#3E8ED0" strokeWidth="2.2" strokeLinecap="round"><line x1="15" y1="33" x2="13.5" y2="37" /><line x1="21" y1="33" x2="19.5" y2="37" /><line x1="27" y1="33" x2="25.5" y2="37" /></g>;
  const body: Record<Icon, React.ReactNode> = {
    sun,
    moon,
    part: <g transform="translate(-4 -5) scale(.9)">{sun}</g>,
    partn: <g transform="translate(-3 -5) scale(.85)">{moon}</g>,
    cloud: null, rain: null, storm: null, snow: null, fog: null,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="wx-icon">
      {body[icon]}
      {icon === "part" || icon === "partn" ? cloud(2) : null}
      {icon === "cloud" ? cloud(-2) : null}
      {icon === "rain" ? <>{cloud(-4)}{drops}</> : null}
      {icon === "storm" ? <>{cloud(-4, "#9AA3AF")}<path d="M21 28l-4 6h4l-2 5 6-7h-4l2-4z" fill="#F2C230" /></> : null}
      {icon === "snow" ? <>{cloud(-4)}<g fill="#9CC3E6"><circle cx="15" cy="34" r="1.6" /><circle cx="21" cy="36" r="1.6" /><circle cx="27" cy="34" r="1.6" /></g></> : null}
      {icon === "fog" ? <g stroke="var(--wx-cloud)" strokeWidth="2.6" strokeLinecap="round"><line x1="9" y1="16" x2="31" y2="16" /><line x1="6" y1="22" x2="34" y2="22" /><line x1="10" y1="28" x2="30" y2="28" /></g> : null}
    </svg>
  );
}

const cache = new Map<string, Promise<Now | null>>();
export function useWeather(d: DestId) {
  const [w, setW] = useState<Now | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    if (!cache.has(d)) cache.set(d, fetch(`/api/weather/${d}`).then((r) => (r.ok ? r.json() : null)).catch(() => null));
    cache.get(d)!.then((x) => { if (live) setW(x); });
    return () => { live = false; };
  }, [d]);
  return w;
}

/** "Right now" strip: live temperature, sky, wind, sunset and the next few days. */
export function WeatherNow({ d, name, compact }: { d: DestId; name: string; compact?: boolean }) {
  const w = useWeather(d);
  if (w === null) return null; // forecast unavailable: show nothing rather than a broken box
  const sun = sunTimes(new Date(), DEST_CENTRE[d]);
  if (w === undefined) return <div className={`wx${compact ? " wx-compact" : ""} wx-wait`} aria-hidden="true" />;
  const s = symbolInfo(w.sym);
  return (
    <div className={`wx${compact ? " wx-compact" : ""}`} aria-label={`Weather now in ${name}`}>
      <div className="wx-now">
        <WeatherIcon icon={s.icon} size={compact ? 36 : 48} />
        <div>
          <div className="wx-t">{w.t}°</div>
          <div className="wx-l">{s.label}</div>
        </div>
      </div>
      <dl className="wx-facts">
        <div><dt>Wind</dt><dd>{windWords(w.wind)}{w.wind >= 1.6 ? `, from the ${compass(w.dir)}` : ""}</dd></div>
        <div><dt>Sunset</dt><dd>{cyTime(sun.set)}</dd></div>
        {!compact ? <div><dt>Sunrise</dt><dd>{cyTime(sun.rise)}</dd></div> : null}
      </dl>
      {!compact ? (
        <ol className="wx-days">
          {w.days.slice(1, 5).map((x) => {
            const si = symbolInfo(x.sym);
            return (
              <li key={x.date}>
                <span className="wx-dn">{cyDay(x.date)}</span>
                <WeatherIcon icon={si.icon} size={28} />
                <span className="wx-hl"><b>{x.hi}°</b> {x.lo}°</span>
              </li>
            );
          })}
        </ol>
      ) : null}
      <p className="wx-src">Forecast: <a href="https://www.met.no/en" target="_blank" rel="noopener noreferrer">MET Norway</a>, updated every 30 minutes</p>
    </div>
  );
}
