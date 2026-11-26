import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { PARTNERS, partnerFor } from "@/lib/partners";
import { runTool } from "@/lib/ask/tools";
import { BUSINESSES, isStay } from "@/lib/data";
import raw from "../data/partners.json";

type R = { partner: { name: string; page: string; label: string } | null; ask?: string; already_mentioned?: string };
const ask = (service: string, staying: string, ctx = {}) => runTool("transfer_partner", { service, staying }, { base: null, ...ctx }) as Promise<R>;

describe("partner rules", () => {
  it("East coast airport transfers go to Go Airport Transfers", async () => {
    for (const s of ["Protaras", "a hotel in Ayia Napa", "Pernera", "Kapparis", "Agia Thekla", "Paralimni"]) expect((await ask("airport_transfer", s)).partner?.name, s).toBe("Go Airport Transfers");
  });
  it("Coral Bay and Peyia transfers and local taxis go to Coral Bay Taxis", async () => {
    expect((await ask("airport_transfer", "a villa in Peyia")).partner?.name).toBe("Coral Bay Taxis");
    expect((await ask("airport_transfer", "Coral Bay")).partner?.name).toBe("Coral Bay Taxis");
    expect((await ask("local_taxi", "our villa in Coral Bay")).partner?.name).toBe("Coral Bay Taxis");
  });
  it("never for local taxis on the east coast, other areas, or just because of an airport", async () => {
    expect((await ask("local_taxi", "Ayia Napa")).partner).toBeNull();
    for (const s of ["Limassol", "Larnaca", "Paphos town", "Nicosia", "Kissonerga", "Polis", "Larnaca airport", "Paphos airport"]) expect((await ask("airport_transfer", s)).partner, s).toBeNull();
  });
  it("asks where they're staying when it doesn't know", async () => {
    const r = await ask("airport_transfer", "");
    expect(r.partner).toBeNull();
    expect(r.ask).toMatch(/where they are staying/);
  });
  it("uses the hotel the visitor set on the site", async () => {
    const h = BUSINESSES.find((b) => isStay(b) && b.d === "protaras" && b.ll)!;
    const r = await ask("airport_transfer", "my hotel", { base: { n: h.n, ll: h.ll!, href: `/listing/${h.i}` } });
    expect(r.partner?.name).toBe("Go Airport Transfers");
    const peyia = BUSINESSES.find((b) => isStay(b) && b.tw === "Peyia" && b.ll)!;
    expect((await ask("airport_transfer", peyia.n)).partner?.name).toBe("Coral Bay Taxis");
  });
  it("recommends once per conversation", async () => {
    const r = await ask("airport_transfer", "Protaras", { earlier: "Go Airport Transfers is our East Coast transfer partner." });
    expect(r.partner).toBeNull();
    expect(r.already_mentioned).toBe("Go Airport Transfers");
  });
  it("is labelled and links to the partner page", async () => {
    const r = await ask("airport_transfer", "Protaras");
    expect(r.partner?.label).toBe("Advertising partner");
    expect(r.partner?.page).toBe("https://welovecy.com/partners/go-airport-transfers");
  });
  it("a paused partner is never recommended", () => {
    const p = PARTNERS[0]; const was = p.status;
    p.status = "paused";
    expect(partnerFor("airport_transfer", { text: "Protaras" })).toBeUndefined();
    p.status = was;
  });
  it("the public partner file holds no commercial terms", () => {
    expect(JSON.stringify(raw.partners)).not.toMatch(/€|eur\b|fee|price|renew|contract|invoice|2,?000/i);
  });
});

describe("links in Aphrodite's answers", () => {
  it("keeps real pages, fixes an area written as a place, and unlinks the rest", async () => {
    const { fixLinks } = await import("@/lib/ask/tools");
    expect(fixLinks("[WaterWorld](https://welovecy.com/places/waterworld)")).toBe("[WaterWorld](https://welovecy.com/places/waterworld)");
    expect(fixLinks("[Ayia Napa](https://welovecy.com/places/ayianapa)")).toBe("[Ayia Napa](https://welovecy.com/destinations/ayianapa)");
    expect(fixLinks("see [this](https://welovecy.com/made-up-page) now")).toBe("see this now");
    expect(fixLinks("[Go](https://welovecy.com/partners/go-airport-transfers)")).toContain("/partners/go-airport-transfers");
    expect(fixLinks("[Kapnos](https://booking.kapnosairportshuttle.com/x)")).toBe("[Kapnos](https://booking.kapnosairportshuttle.com/x)");
    expect(fixLinks("[duty](https://welovecy.com/pharmacies-on-duty/larnaca)")).toContain("/pharmacies-on-duty/larnaca");
  });
});

describe("airport answers and the sitemap", () => {
  it("the airport guide search hands Aphrodite the Intercity bus and fixed fares", async () => {
    const r = (await runTool("guides", { query: "Larnaca airport Protaras" }, { base: null })) as { results: { title: string; text?: string }[] };
    expect(r.results[0].title).toMatch(/Larnaca Airport to Ayia Napa/);
    expect(r.results[0].text).toMatch(/Intercity/);
    expect(r.results[0].text).toMatch(/€50/);
  });
  it("lists attractions and venues, never partner or bus stop pages", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const urls = sitemap().map((e) => new URL(e.url).pathname);
    expect(urls).toContain("/listing/att-trail-artemis");
    expect(urls).toContain("/listing/att-tio-larnaca");
    expect(urls.some((u) => u.startsWith("/listing/cy-"))).toBe(true);
    expect(urls.some((u) => u.startsWith("/partners/") || u.startsWith("/buses/stop/"))).toBe(false);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.length).toBeLessThan(50000);
  });
});
