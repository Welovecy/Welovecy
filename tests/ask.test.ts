import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { runTool } from "@/lib/ask/tools";

const ctx = { base: null };
describe("ask tools", () => {
  it("finds places by name", async () => {
    const r = (await runTool("find_places", { query: "Nissi" }, ctx)) as { results: { n: string; link: string }[] };
    expect(r.results.length).toBeGreaterThan(0);
    expect(r.results[0].n.toLowerCase()).toContain("nissi");
    expect(r.results[0].link).toMatch(/^https:\/\/welovecy\.com\//);
  });
  it("finds Glasshouse inside Adams", async () => {
    const r = (await runTool("find_places", { query: "glasshouse" }, ctx)) as { results: { facts: string }[] };
    expect(r.results[0].facts).toContain("inside a hotel");
  });
  it("lists what's near a hotel", async () => {
    const r = (await runTool("whats_near", { place: "Adams Beach", kind: "beach", limit: 3 }, ctx)) as { results: { n: string; distance: string }[] };
    expect(r.results.length).toBe(3);
  });
  it("uses the visitor's base", async () => {
    const r = (await runTool("whats_near", { place: "my hotel", kind: "pharmacy" }, { base: { n: "Test hotel", ll: [34.9868, 33.9666], href: "/around" } })) as { from: { n: string } };
    expect(r.from.n).toBe("Test hotel");
  });
  it("gives the duty pharmacies with hours", async () => {
    const r = (await runTool("pharmacies_on_duty", { district: "paphos", date: "2026-12-02" }, ctx)) as { hours: string; pharmacies: unknown[] };
    expect(r.hours).toContain("13:30 to 22:00");
    expect(r.pharmacies.length).toBeGreaterThan(0);
  });
  it("taxi figures are a range", async () => {
    const r = (await runTool("distance", { from: "Nissi Beach", to: "Fig Tree Bay" }, ctx)) as { getting_there: string };
    expect(r.getting_there).toMatch(/€\d+–\d+ by taxi \(estimate\)/);
  });
  it("searches guides", async () => {
    const r = (await runTool("guides", { query: "Larnaca airport Ayia Napa bus" }, ctx)) as { results: { link: string }[] };
    expect(r.results[0].link).toContain("larnaca-airport-to-ayia-napa");
  });
});

import { cardsFrom } from "@/lib/ask/tools";
describe("ask cards", () => {
  it("pharmacy cards carry call and map", async () => {
    const c = cardsFrom("pharmacies_on_duty", await runTool("pharmacies_on_duty", { district: "paphos", date: "2026-12-02" }, { base: null }));
    expect(c[0].tel).toMatch(/^\+357 /);
    expect(c[0].map).toContain("google.com/maps");
  });
  it("hotel cards offer 'my hotel'", async () => {
    const c = cardsFrom("find_places", await runTool("find_places", { query: "Adams Beach", kind: "stay" }, { base: null }));
    expect(c[0].stay?.id).toBe("cy-00011");
  });
  it("site pages finds new sections from the sitemap", async () => {
    const r = (await runTool("site_pages", { query: "wine" }, { base: null })) as { results: { link: string }[] };
    expect(r.results.some((x) => x.link.endsWith("/wine"))).toBe(true);
  });
});

import { getBusiness, getPoi } from "@/lib/data";
import { insideOf } from "@/lib/views";
describe("attractions", () => {
  it("loads attractions as places with sources", () => {
    const a = getPoi("att-ocean-aquarium")!;
    expect(a.n).toBe("Protaras Ocean Aquarium");
    expect(a.srcs?.length).toBeGreaterThan(0);
    expect(a.d).toBe("protaras");
  });
  it("links the restaurant inside and pins it to the aquarium", () => {
    const b = getBusiness("cy-00511")!;
    expect(b.at).toBe("att-ocean-aquarium");
    expect(b.pr).toBeUndefined();
    expect(insideOf("att-kings-avenue-mall").length).toBeGreaterThan(8);
  });
  it("Aphrodite finds attractions by alias", async () => {
    const r = (await runTool("find_places", { query: "Fasouri Waterpark" }, { base: null })) as { results: { n: string }[] };
    expect(r.results[0].n).toContain("Fasouri");
  });
});

describe("diving", () => {
  it("lists dive centres near Protaras as an activity", async () => {
    const r = (await runTool("whats_near", { place: "Fig Tree Bay", kind: "activity", limit: 5 }, { base: null })) as { results: { n: string }[] };
    expect(r.results.length).toBe(5);
  });
});
