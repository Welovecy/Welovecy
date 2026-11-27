import { describe, expect, it } from "vitest";
import { KNOW_FACTS, KNOW_SECTIONS, searchFacts } from "../src/lib/knowledge";

describe("know before you go", () => {
  it("every fact has a section, text and an https source", () => {
    const secs = new Set(KNOW_SECTIONS.map((s) => s.id));
    for (const f of KNOW_FACTS) {
      expect(secs.has(f.sec), f.id).toBe(true);
      expect(f.t.length, f.id).toBeGreaterThan(20);
      expect(f.src.length, f.id).toBeGreaterThan(0);
      for (const s of f.src) expect(s.u.startsWith("https://"), f.id).toBe(true);
    }
  });
  it("ids are unique and copy has no em dashes", () => {
    expect(new Set(KNOW_FACTS.map((f) => f.id)).size).toBe(KNOW_FACTS.length);
    for (const f of KNOW_FACTS) expect(f.t.includes("—"), f.id).toBe(false);
  });
  it.each([
    ["Do I need a visa from the UK?", "uk-90-days"],
    ["Is Cyprus in Schengen?", "not-schengen"],
    ["Can I fly my drone?", "drones"],
    ["Can I drink the tap water?", "tap-water"],
    ["What age can you drink alcohol?", "alcohol-age"],
    ["When is the best time to visit?", "best-time"],
    ["Are shops open on Sunday?", "shops"],
    ["What should I wear to Kykkos monastery?", "church-dress"],
    ["Will my phone roam for free?", "roaming"],
    ["Do I need a GHIC?", "ghic"],
  ])("%s finds %s", (q, id) => {
    expect(searchFacts(q).map((f) => f.id)).toContain(id);
  });
  it("finds nothing for an unrelated question", () => {
    expect(searchFacts("xylophone")).toEqual([]);
  });
});
