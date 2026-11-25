import { describe, expect, it } from "vitest";
import { EVENTS, weekend, overlaps, ics } from "@/lib/events";

describe("events data", () => {
  it("every event has a source and sane dates", () => {
    for (const e of EVENTS) {
      expect(e.source, e.id).toMatch(/^https:\/\//);
      if (e.status === "confirmed") expect(e.start, e.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (e.start && e.end) expect(e.end >= e.start, e.id).toBe(true);
      expect(e.desc.includes("—"), `${e.id} has an em dash`).toBe(false);
    }
  });
  it("ids are unique", () => { expect(new Set(EVENTS.map((e) => e.id)).size).toBe(EVENTS.length); });
  it("weekend runs Friday to Sunday", () => {
    expect(weekend("2026-11-26")).toEqual(["2026-11-27", "2026-11-29"]);
    expect(weekend("2026-11-29")).toEqual(["2026-11-27", "2026-11-29"]);
  });
  it("Christmas villages are on this weekend", () => {
    const [a, b] = weekend("2026-11-26");
    expect(EVENTS.some((e) => e.type === "christmas" && overlaps(e, a, b))).toBe(true);
  });
  it("calendar file is all-day with an exclusive end", () => {
    const c = ics(EVENTS.find((e) => e.id === "limassol-carnival-2027")!);
    expect(c).toContain("DTSTART;VALUE=DATE:20270304");
    expect(c).toContain("DTEND;VALUE=DATE:20270315");
  });
});
