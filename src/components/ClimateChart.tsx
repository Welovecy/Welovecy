import { CLIMATE, CLIMATE_SOURCE, MON, MONTHS } from "@/lib/weather";
import type { DestId } from "@/lib/types";

/** Month-by-month averages: day and night temperature as a bar, sea temperature as a line. */
export function ClimateChart({ d, name }: { d: DestId; name: string }) {
  const c = CLIMATE[d];
  if (!c) return null;
  const W = 720, H = 230, top = 28, bot = 34, lo = Math.min(0, Math.floor(Math.min(...c.lo) / 5) * 5), hi = 40;
  const y = (v: number) => top + (1 - (v - lo) / (hi - lo)) * (H - top - bot);
  const colW = W / 12, x = (i: number) => colW * i + colW / 2;
  const warm = (t: number) => (t >= 30 ? "#E07A1F" : t >= 25 ? "#EC9A3A" : t >= 20 ? "#F0B85C" : t >= 14 ? "#9DBB8A" : "#8DB3D4");
  const seaPath = c.sea ? c.sea.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ") : "";
  const swimFrom = c.sea ? c.sea.findIndex((v) => v >= 22) : -1;
  const swimTo = c.sea ? 11 - [...c.sea].reverse().findIndex((v) => v >= 22) : -1;
  return (
    <figure className="clim">
      <div className="clim-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Average temperatures in ${name} by month`} className="clim-svg">
          {[0, 10, 20, 30, 40].filter((v) => v >= lo).map((v) => (
            <g key={v}><line x1="0" x2={W} y1={y(v)} y2={y(v)} className="clim-grid" /><text x="2" y={y(v) - 4} className="clim-ax">{v}°</text></g>
          ))}
          {c.hi.map((h, i) => (
            <g key={i}>
              <rect x={x(i) - 11} y={y(h)} width="22" height={Math.max(4, y(c.lo[i]) - y(h))} rx="11" fill={warm(h)} />
              <text x={x(i)} y={y(h) - 7} textAnchor="middle" className="clim-v">{Math.round(h)}°</text>
              <text x={x(i)} y={H - 12} textAnchor="middle" className="clim-m">{MON[i]}</text>
            </g>
          ))}
          {c.sea ? <path d={seaPath} className="clim-sea" /> : null}
          {c.sea ? c.sea.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3.5" className="clim-seadot" />) : null}
        </svg>
      </div>
      <div className="clim-key">
        <span><i className="k-air" /> Day high to night low</span>
        {c.sea ? <span><i className="k-sea" /> Sea temperature</span> : null}
      </div>
      <div className="clim-rows">
        <table>
          <thead><tr><th scope="col"><span className="vh">Measure</span></th>{MON.map((m) => <th key={m} scope="col">{m}</th>)}</tr></thead>
          <tbody>
            <tr><th scope="row">Rainy days</th>{c.rain.map((v, i) => <td key={i}>{v < 0.5 ? "0" : Math.round(v)}</td>)}</tr>
            <tr><th scope="row">Sun, hours a day</th>{c.sun.map((v, i) => <td key={i}>{Math.round(v / [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][i])}</td>)}</tr>
          </tbody>
        </table>
      </div>
      {swimFrom >= 0 ? <p className="clim-tip"><b>Best for swimming:</b> {MONTHS[swimFrom]} to {MONTHS[swimTo]}, when the sea is 22° or warmer.</p> : <p className="clim-tip"><b>Warmest:</b> {MONTHS[c.hi.indexOf(Math.max(...c.hi))]}, around {Math.round(Math.max(...c.hi))}° by day. <b>Coolest:</b> {MONTHS[c.lo.indexOf(Math.min(...c.lo))]}, around {Math.round(Math.min(...c.lo))}° at night.</p>}
      <figcaption className="clim-src">
        Long-term averages from the Cyprus Department of Meteorology, {c.station} station{c.seaStation ? `; sea temperatures are approximate monthly averages for ${c.seaStation === c.station ? "this coast" : c.seaStation} (weather2travel)` : ""}{c.sunStation !== c.station ? `; sunshine from ${c.sunStation}` : ""}. Source: <a href={CLIMATE_SOURCE.u} target="_blank" rel="noopener noreferrer">Climate of Cyprus</a>, checked {CLIMATE_SOURCE.checked}.
      </figcaption>
    </figure>
  );
}
