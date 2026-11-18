import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { BUSINESSES, DESTINATIONS, PLACES, POIS, spots, getDest, placeForPoi } from "@/lib/data";
import { essentials, byDistance } from "@/lib/around";
import content from "@data/content.json";

/** Republic of Cyprus coverage only. Generous outer box, then a line that keeps points south of the north. */
function inRepublic([lat, lon]: [number, number]) {
  if (lat < 34.55 || lat > 35.25 || lon < 32.25 || lon > 34.6) return false;
  // Rough line of control, west to east. Republic land stays south of it.
  if (lon >= 32.75 && lon < 33.25 && lat > 35.175) return false; // Morphou bay
  if (lon >= 33.25 && lon < 33.43 && lat > 35.185) return false; // north Nicosia
  if (lon >= 33.43 && lon < 33.95 && lat > 35.14) return false; // Mesaoria
  if (lon >= 33.95 && lat > 35.1) return false; // Famagusta and beyond
  return true;
}

const NORTH_WORDS = /\b(kyrenia|girne|famagusta old town|varosha|kantara|bellapais|morphou|guzelyurt|karpas|occupied|north cyprus|trnc)\b/i;

describe("scope", () => {
  it("has unique ids across businesses and essentials", () => {
    const ids = [...BUSINESSES.map((b) => b.i), ...POIS.map((p) => p.i)];
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("keeps every mapped point inside the Republic of Cyprus", () => {
    const out = [
      ...BUSINESSES.filter((b) => b.ll && !inRepublic(b.ll)).map((b) => b.i + " " + b.n),
      ...POIS.filter((p) => p.ll && !inRepublic(p.ll)).map((p) => p.i + " " + p.n),
      ...PLACES.filter((p) => p.ll && !inRepublic(p.ll)).map((p) => p.slug),
    ];
    expect(out).toEqual([]);
  });
  it("never mentions the north in written content", () => {
    expect(JSON.stringify(content)).not.toMatch(NORTH_WORDS);
    const towns = new Set([...BUSINESSES.map((b) => b.tw), ...POIS.map((p) => p.tw || "")]);
    expect([...towns].filter((t) => NORTH_WORDS.test(t))).toEqual([]);
  });
  it("assigns every record to a known area", () => {
    const ids = new Set(DESTINATIONS.map((d) => d.id));
    expect(BUSINESSES.every((b) => ids.has(b.d))).toBe(true);
    expect(POIS.every((p) => ids.has(p.d))).toBe(true);
    expect(PLACES.every((p) => ids.has(p.dest))).toBe(true);
  });
  it("labels Protaras hotels as Protaras, not Paralimni, east of the town", () => {
    const wrong = BUSINESSES.filter((b) => b.ll && b.ll[1] >= 34.03 && b.tw === "Paralimni");
    expect(wrong).toEqual([]);
  });
});

describe("content links", () => {
  it("resolves every start, next and nearby reference", () => {
    const slugs = new Set(PLACES.map((p) => p.slug));
    for (const d of DESTINATIONS) {
      for (const s of d.start || []) expect(slugs.has(s), `${d.id} start ${s}`).toBe(true);
      for (const n of d.next || []) expect(getDest(n), `${d.id} next ${n}`).toBeTruthy();
    }
    for (const p of PLACES) for (const k of p.nearby || []) {
      if (k.startsWith("place-")) expect(slugs.has(k.slice(6)), `${p.slug} nearby ${k}`).toBe(true);
    }
  });
  it("matches written beach pages to official beach records", () => {
    expect(placeForPoi("bea-00966") ?? "none").toBeTypeOf("string");
    const nissi = POIS.find((r) => r.k === "beach" && r.n === "Nissi Beach");
    if (nissi) expect(placeForPoi(nissi.i)).toBe("nissi");
  });
  it("uses no em dashes in written copy", () => {
    expect(JSON.stringify(content)).not.toMatch(/—/);
  });
});

describe("around", () => {
  it("finds a pharmacy, a supermarket and a beach within reach of Fig Tree Bay", () => {
    const fig = PLACES.find((p) => p.slug === "fig-tree-bay")!;
    const e = essentials(fig.ll!, spots(), "place-fig-tree-bay");
    for (const kind of ["pharmacy", "market", "beach"]) expect(e.find((x) => x.kind === kind)?.near, kind).toBeTruthy();
  });
  it("says nothing is mapped rather than pointing 100 km away", () => {
    const e = essentials([35.0, 32.95], spots().filter((s) => s.ll[1] > 33.9));
    expect(e.every((x) => x.near === null)).toBe(true);
  });
  it("sorts by distance and skips the starting point", () => {
    const pool = spots();
    const list = byDistance(pool[0].ll, pool, pool[0].key);
    expect(list.some((n) => n.s.key === pool[0].key)).toBe(false);
    for (let i = 1; i < list.length; i++) expect(list[i].d).toBeGreaterThanOrEqual(list[i - 1].d);
  });
});
