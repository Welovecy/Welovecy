import fs from "node:fs";
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

import { GUIDES } from "../src/lib/guides";
import { monthCopy } from "../src/lib/months";
describe("guides and month pages", () => {
  it("every guide is complete, sourced and on-brand", () => {
    expect(GUIDES.length).toBeGreaterThan(0);
    for (const g of GUIDES) {
      expect(g.title && g.description && g.date, g.slug).toBeTruthy();
      expect(g.sources.length, g.slug).toBeGreaterThan(0);
      for (const s of [g.title, g.description, g.html, ...g.quick]) {
        expect(s, g.slug).not.toMatch(/—/);
        expect(s, g.slug).not.toMatch(/kyrenia|varosha|occupied|north cyprus|northern cyprus/i);
      }
      for (const s of g.sources) expect(s.u).not.toMatch(/utm_source/);
    }
  });
  it("guide links point at real pages", () => {
    const slugs = new Set(GUIDES.map((g) => g.slug));
    const content = JSON.parse(fs.readFileSync("data/content.json", "utf8")) as { PLACES: Record<string, unknown>; DEST: { id: string }[] };
    const places = new Set(Object.keys(content.PLACES));
    const dests = new Set(content.DEST.map((d) => d.id));
    for (const g of GUIDES) {
      for (const r of g.related) expect(slugs.has(r), `${g.slug} related ${r}`).toBe(true);
      for (const [, kind, id] of g.html.matchAll(/href="\/(guides|places|destinations)\/([a-z0-9-]+)/g)) {
        const ok = kind === "guides" ? slugs.has(id) : kind === "places" ? places.has(id) : dests.has(id);
        expect(ok, `${g.slug} links /${kind}/${id}`).toBe(true);
      }
    }
  });
  it("month copy reads sensibly all year", () => {
    for (let m = 0; m < 12; m++) {
      const c = monthCopy(m);
      for (const s of [c.lead, c.swim, c.heat, c.wet, c.pack, c.mountains]) { expect(s).not.toMatch(/—|NaN|undefined/); expect(s.length).toBeGreaterThan(20); }
    }
    expect(monthCopy(7).swim).toMatch(/^Yes/);
    expect(monthCopy(1).swim).toMatch(/bracing|Some/);
    expect(monthCopy(0).mountains).toMatch(/snow/);
  });
});

import { BEACH_HOTELS, NEAR_KM } from "../src/lib/hotelsNear";
describe("hotels near the beach", () => {
  it("has unique pages, each with enough hotels, sorted closest first", () => {
    expect(BEACH_HOTELS.length).toBeGreaterThan(20);
    expect(new Set(BEACH_HOTELS.map((b) => b.slug)).size).toBe(BEACH_HOTELS.length);
    for (const b of BEACH_HOTELS) {
      expect(b.slug, b.name).toMatch(/^[a-z0-9-]+$/);
      expect(b.hotels.length).toBeGreaterThanOrEqual(4);
      for (let i = 1; i < b.hotels.length; i++) expect(b.hotels[i].d).toBeGreaterThanOrEqual(b.hotels[i - 1].d);
      expect(b.hotels.at(-1)!.d).toBeLessThanOrEqual(NEAR_KM);
    }
    expect(BEACH_HOTELS.some((b) => b.slug === "nissi-beach")).toBe(true);
  });
});

import duty from "../data/duty.json";
import { DISTRICTS, addDays, cyToday, daysLeft, dutyHours, dutyOn } from "../src/lib/duty";
describe("pharmacies on duty", () => {
  it("covers every district, every day, with pharmacy phones only", () => {
    const d = duty as unknown as { from: string; to: string; d: Record<string, Record<string, { ph?: string; te: string; ll?: number[] }[]>> };
    for (const x of DISTRICTS) {
      const days = Object.keys(d.d[x.id]);
      const span = Math.round((Date.parse(d.to) - Date.parse(d.from)) / 864e5) + 1;
      expect(days.length, x.id).toBeGreaterThanOrEqual(span);
      for (const list of Object.values(d.d[x.id])) for (const p of list) {
        expect(p.te).toMatch(/^[A-Z]/);
        expect(p.ll).toBeTruthy();
        if (p.ph) expect(p.ph).toMatch(/^2\d{7}$/); // landlines only: mobile (9x) numbers would be personal
      }
    }
    expect(JSON.stringify(d)).not.toMatch(/Οικία|Τηλέφωνο/);
  });
  it("knows the hours and the date in Cyprus", () => {
    expect(dutyHours("2026-11-23").text).toBe("13:30 to 15:00 and 18:30 to 22:00");
    expect(dutyHours("2026-11-25").text).toBe("13:30 to 22:00");
    expect(dutyHours("2026-11-29").text).toBe("08:00 to 22:00");
    expect(dutyHours("2026-12-25").text).toBe("08:00 to 22:00");
    expect(cyToday(new Date("2026-11-23T22:30:00Z"))).toBe("2026-11-24");
    expect(dutyOn("famagusta", "2026-11-23")?.length).toBe(2);
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });
  // Fails the build-time test run three weeks before the rota runs out: time to download the next one.
  it("has the next three weeks of rota", () => {
    expect(daysLeft(), "Duty pharmacy rota ends soon: get the next season's files from gov.cy and run scripts/content/duty.py").toBeGreaterThan(21);
  });
});

import { GOING, VENUE_PAGES, CUISINE_PAGES, venuesIn } from "../src/lib/going";
import { BUSINESSES } from "../src/lib/data";
describe("eat and drink", () => {
  it("builds unique, worthwhile pages", () => {
    expect(GOING.length).toBeGreaterThan(40);
    const keys = GOING.map((g) => `${g.area}/${g.slug}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const g of GOING) expect(g.list.length, g.title).toBeGreaterThanOrEqual(4);
    const slugs = [...VENUE_PAGES.map((v) => v.slug), ...CUISINE_PAGES.map((c) => c.slug)];
    expect(new Set(slugs).size).toBe(slugs.length);
  });
  it("never lists cabarets, and every venue has a type", () => {
    for (const g of GOING) for (const b of g.list) expect(b.vt).not.toBe("cabaret");
    const v = BUSINESSES.filter((b) => b.g === "eat" || b.g === "cafe" || b.g === "night");
    for (const b of v) expect(b.vt, b.n).toBeTruthy();
    expect(venuesIn("ayianapa").length).toBeGreaterThan(50);
  });
  it("shows clean names and sensible pins", () => {
    for (const b of BUSINESSES) {
      expect(b.n, b.i).not.toMatch(/\(\s*[^)]*\)\s*$/);
      if (b.ll) { expect(b.ll[0]).toBeGreaterThan(34.5); expect(b.ll[0]).toBeLessThan(35.25); expect(b.ll[1]).toBeGreaterThan(32.2); expect(b.ll[1]).toBeLessThan(34.15); }
    }
  });
});
