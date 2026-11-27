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
    ["Which villages should we visit near Limassol?", "village-omodos"],
    ["Where can I see lace being made?", "village-lefkara"],
    ["Where should we stay for nightlife?", "area-nightlife"],
    ["Best area to stay without a car?", "area-no-car"],
    ["What happened in 1974?", "hist-1974"],
    ["How do I get a yellow slip?", "live-eu-yellow-slip"],
    ["How do I register with GESY?", "live-gesy-register"],
    ["Can I swap my UK driving licence?", "live-licence-uk"],
    ["How do I put the electricity in my name?", "live-electricity"],
    ["Tell me about Richard the Lionheart in Cyprus", "hist-richard"],
  ])("%s finds %s", (q, id) => {
    expect(searchFacts(q).map((f) => f.id)).toContain(id);
  });
  it("finds nothing for an unrelated question", () => {
    expect(searchFacts("xylophone")).toEqual([]);
  });
});

import attractions from "../data/attractions.json";
import { DEST_CENTRE } from "../src/lib/centres";
import { isIndoor } from "../src/lib/indoor";
type A = { i: string; cat: string; ll?: [number, number] };
const near = (ll: [number, number]) => Object.entries(DEST_CENTRE).sort((x, y) => (x[1][0] - ll[0]) ** 2 + (x[1][1] - ll[1]) ** 2 - ((y[1][0] - ll[0]) ** 2 + (y[1][1] - ll[1]) ** 2))[0][0];
const POIS = (attractions as unknown as { items: A[] }).items.filter((a) => a.ll).map((a) => ({ ...a, d: near(a.ll!) }));
describe("rainy days", () => {
  it("every main area has an indoor place", () => {
    for (const d of ["ayianapa", "protaras", "paphos", "limassol", "larnaca", "nicosia"]) {
      expect(POIS.some((p) => p.d === d && isIndoor(p.cat)), d).toBe(true);
    }
  });
  it("Thalassa museum counts as Ayia Napa", () => {
    expect(POIS.find((p) => p.i === "att-thalassa-museum")?.d).toBe("ayianapa");
  });
});
