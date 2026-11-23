import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import quiz from "../data/quiz.json";
import { CLIMATE, symbolInfo, sunTimes, monthVerdict } from "../src/lib/weather";
import { DESTINATIONS, PLACES } from "../src/lib/data";
import { parseForecast } from "../src/lib/forecast";

describe("quiz bank", () => {
  const slugs = new Set(PLACES.map((p) => p.slug));
  it("every question is well formed and links somewhere real", () => {
    expect(quiz.length).toBeGreaterThanOrEqual(20);
    const ids = new Set<string>();
    for (const q of quiz) {
      expect(ids.has(q.id)).toBe(false); ids.add(q.id);
      expect(q.o.length).toBe(4);
      expect(q.a).toBeGreaterThanOrEqual(0); expect(q.a).toBeLessThan(4);
      expect(new Set(q.o).size).toBe(4);
      const h = q.href.split("#")[0];
      if (h.startsWith("/places/")) expect(slugs.has(h.slice(8)), h).toBe(true);
      for (const s of [q.q, q.why, ...q.o]) { expect(s).not.toMatch(/—/); expect(s).not.toMatch(/north(ern)? cyprus|kyrenia|famagusta(?! gate)|occupied/i); }
    }
  });
});

describe("climate", () => {
  it("has twelve months for every area", () => {
    for (const d of DESTINATIONS) {
      const c = CLIMATE[d.id];
      expect(c, d.id).toBeTruthy();
      for (const k of ["hi", "lo", "rain", "sun"] as const) expect(c[k].length).toBe(12);
      if (c.sea) expect(c.sea.length).toBe(12);
      c.hi.forEach((h, i) => expect(h).toBeGreaterThan(c.lo[i]));
    }
  });
  it("gives sensible verdicts and sun times", () => {
    expect(monthVerdict(CLIMATE.ayianapa, 7)).toBe("Beach weather");
    const { rise, set } = sunTimes(new Date("2026-06-21T12:00:00Z"), [34.98, 34.0]);
    const h = (d: Date) => d.getUTCHours() + d.getUTCMinutes() / 60;
    expect(h(rise)).toBeGreaterThan(2); expect(h(rise)).toBeLessThan(3); // about 05:30 local
    expect(h(set)).toBeGreaterThan(16.5); expect(h(set)).toBeLessThan(17.5); // about 20:00 local
    expect(symbolInfo("partlycloudy_night").icon).toBe("partn");
    expect(symbolInfo("lightrainshowers_day").label).toBe("Light rain");
  });
});

describe("weather endpoint", () => {
  it("turns a MET Norway forecast into now + days", async () => {
    const start = Date.UTC(2026, 10, 23, 10);
    const ts = Array.from({ length: 72 }, (_, i) => ({
      time: new Date(start + i * 3600e3).toISOString(),
      data: { instant: { details: { air_temperature: 15 + (i % 24 > 8 && i % 24 < 16 ? 7 : 0), wind_speed: 4, wind_from_direction: 270 } },
        next_1_hours: { summary: { symbol_code: "fair_day" }, details: { precipitation_amount: 0 } },
        next_6_hours: { summary: { symbol_code: "partlycloudy_day" }, details: { precipitation_amount: 0.4 } } },
    }));
    const j = parseForecast(ts, start + 600e3);
    expect(j.t).toBe(15); expect(j.sym).toBe("fair_day"); expect(j.days.length).toBeGreaterThanOrEqual(3);
    expect(j.days[1].hi).toBe(22); expect(j.days[1].lo).toBe(15);
  });
});
