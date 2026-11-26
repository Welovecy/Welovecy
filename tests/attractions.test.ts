import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { POIS, getPlace, linkedToPlace } from "@/lib/data";
import { poiFacts } from "@/lib/listing";
import att from "../data/attractions.json";

const items = (att as { items: { i: string; k: string; srcs?: { u: string }[]; place?: string; len?: string; grade?: number; ph?: string; ll?: number[] }[] }).items;

describe("attractions data", () => {
  it("every record has a source besides the map", () => {
    for (const a of items) expect((a.srcs ?? []).some((s) => !s.u.includes("openstreetmap.org")), a.i).toBe(true);
  });
  it("ids are unique", () => {
    expect(new Set(items.map((a) => a.i)).size).toBe(items.length);
  });
  it("trails carry length and an official grade from 1 to 3", () => {
    const trails = items.filter((a) => a.i.startsWith("att-trail-"));
    expect(trails.length).toBeGreaterThanOrEqual(16);
    for (const t of trails) { expect(t.len, t.i).toBeTruthy(); expect([1, 2, 3]).toContain(t.grade); }
  });
  it("tourist offices all have a phone", () => {
    const tio = items.filter((a) => a.k === "info");
    expect(tio.length).toBe(8);
    for (const t of tio) expect(t.ph, t.i).toMatch(/^\+357 /);
  });
  it("place links point at real place pages", () => {
    for (const a of items) if (a.place) expect(getPlace(a.place), `${a.i} -> ${a.place}`).toBeTruthy();
    expect(linkedToPlace("konnos").map((r) => r.i)).toContain("att-trail-konnoi-cyclops");
  });
  it("closures show as a flagged status line", () => {
    const m = POIS.find((r) => r.i === "att-larnaca-medieval-museum")!;
    expect(poiFacts(m).find((f) => f[0] === "Status")?.[2]).toBe(true);
    expect(getPlace("avakas-gorge")?.notice?.src.u).toMatch(/^https:/);
  });
});

describe("Aphrodite and walks", () => {
  it("finds a trail with its length and the Avakas closure", async () => {
    const { runTool } = await import("@/lib/ask/tools");
    const r = (await runTool("find_places", { query: "Artemis" }, { base: null })) as { results: { n: string; facts: string }[] };
    expect(r.results[0].facts).toMatch(/7 km/);
    const a = (await runTool("find_places", { query: "Avakas" }, { base: null })) as { results: { facts: string }[] };
    expect(a.results[0].facts).toMatch(/^NOTICE/);
  });
});
