import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import fs from "node:fs";
import path from "node:path";
import { DESTINATIONS, getPlace } from "@/lib/data";
import { CLIMATE, sunTimes, symbolInfo, windWords } from "@/lib/weather";
import { DEST_CENTRE } from "@/lib/centres";
import quiz from "@data/quiz.json";

const PAGES = new Set(fs.readdirSync(path.join(__dirname, "../src/app"), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => "/" + d.name));

describe("weather", () => {
  it("has twelve months of sensible averages for every area", () => {
    for (const d of DESTINATIONS) {
      const c = CLIMATE[d.id];
      expect(c, d.id).toBeTruthy();
      for (const k of ["hi", "lo", "rain", "sun"] as const) expect(c[k]).toHaveLength(12);
      c.hi.forEach((h, i) => expect(h).toBeGreaterThan(c.lo[i]));
      if (c.sea) { expect(c.sea).toHaveLength(12); c.sea.forEach((s) => expect(s).toBeGreaterThan(14)); }
      expect(DEST_CENTRE[d.id]).toBeTruthy();
    }
  });
  it("puts summer sunsets later than winter ones", () => {
    const ll = DEST_CENTRE.paphos;
    const june = sunTimes(new Date(Date.UTC(2026, 5, 21)), ll).set.getUTCHours();
    const dec = sunTimes(new Date(Date.UTC(2026, 11, 21)), ll).set.getUTCHours();
    expect(june).toBe(17); // 19:5x local
    expect(dec).toBe(14); // 16:4x local
  });
  it("reads weather symbols and wind in plain words", () => {
    expect(symbolInfo("partlycloudy_night").icon).toBe("partn");
    expect(symbolInfo("lightrainshowers_day").label).toBe("Light rain");
    expect(symbolInfo("clearsky_day").label).toBe("Sunny");
    expect(windWords(0.5)).toBe("Calm");
    expect(windWords(9)).toBe("Windy");
  });
});

describe("quiz", () => {
  it("has well-formed questions with one right answer and a working link", () => {
    const ids = new Set<string>();
    for (const q of quiz) {
      expect(ids.has(q.id), q.id).toBe(false); ids.add(q.id);
      expect(q.o).toHaveLength(4);
      expect(new Set(q.o).size).toBe(4);
      expect(q.a).toBeGreaterThanOrEqual(0); expect(q.a).toBeLessThan(4);
      const [p, slug] = q.href.split("#")[0].split("/").filter(Boolean);
      if (p === "places") expect(getPlace(slug), q.href).toBeTruthy();
      else if (p === "destinations" && slug) expect(DESTINATIONS.some((d) => d.id === slug), q.href).toBe(true);
      else expect(PAGES.has("/" + p), q.href).toBe(true);
    }
    expect(quiz.length).toBeGreaterThanOrEqual(20);
  });
  it("follows the copy rules", () => {
    const text = JSON.stringify(quiz);
    expect(text).not.toMatch(/—/);
    expect(text).not.toMatch(/north cyprus|northern cyprus|trnc|kyrenia|famagusta(?! gate)/i);
  });
});
