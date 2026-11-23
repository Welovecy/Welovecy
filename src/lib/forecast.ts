import type { Now } from "./weather";

const dayKey = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Nicosia" });
const hourOf = (iso: string) => Number(new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", hour12: false, timeZone: "Asia/Nicosia" }));

export interface Step {
  time: string;
  data: {
    instant: { details: { air_temperature: number; wind_speed: number; wind_from_direction: number } };
    next_1_hours?: { summary: { symbol_code: string }; details?: { precipitation_amount?: number } };
    next_6_hours?: { summary: { symbol_code: string }; details?: { precipitation_amount?: number } };
    next_12_hours?: { summary: { symbol_code: string } };
  };
}

/** Turn MET Norway's hourly timeseries into "now" plus a day-by-day summary in Cyprus time. */
export function parseForecast(ts: Step[], nowMs: number): Now {
  const cur = ts.find((s) => new Date(s.time).getTime() + 3600e3 > nowMs) ?? ts[0];
  const d = cur.data;
  const days = new Map<string, { hi: number; lo: number; sym?: string; symH: number; rain: number }>();
  for (const s of ts) {
    const k = dayKey(s.time), h = hourOf(s.time), t = s.data.instant.details.air_temperature;
    const e = days.get(k) ?? { hi: -99, lo: 99, symH: 99, rain: 0 };
    e.hi = Math.max(e.hi, t); e.lo = Math.min(e.lo, t);
    const sym = s.data.next_6_hours?.summary.symbol_code ?? s.data.next_1_hours?.summary.symbol_code;
    // the symbol nearest midday describes the day best
    if (sym && Math.abs(h - 12) < Math.abs(e.symH - 12)) { e.sym = sym; e.symH = h; }
    if ([0, 6, 12, 18].includes(h)) e.rain += s.data.next_6_hours?.details?.precipitation_amount ?? 0;
    days.set(k, e);
  }
  return {
    at: cur.time,
    t: Math.round(d.instant.details.air_temperature),
    wind: d.instant.details.wind_speed,
    dir: d.instant.details.wind_from_direction,
    sym: d.next_1_hours?.summary.symbol_code ?? d.next_6_hours?.summary.symbol_code ?? "cloudy",
    rain1h: d.next_1_hours?.details?.precipitation_amount ?? 0,
    days: [...days.entries()].slice(0, 6).filter(([, e]) => e.sym).map(([date, e]) => ({ date, hi: Math.round(e.hi), lo: Math.round(e.lo), sym: e.sym!.replace("_night", "_day"), rain: Math.round(e.rain * 10) / 10 })),
  };
}
