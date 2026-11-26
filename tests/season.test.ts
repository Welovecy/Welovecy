import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { SEASONS, isClosed, seasonFor, seasonLine } from "@/lib/season";
import { POIS, BUSINESSES, PLACES } from "@/lib/data";

describe("seasonal places", () => {
  it("every seasonal key is a real record", () => {
    const keys = new Set([...POIS.map((r) => r.i), ...BUSINESSES.map((b) => b.i), ...PLACES.map((p) => `place-${p.slug}`)]);
    for (const k of Object.keys(SEASONS)) expect(keys.has(k), k).toBe(true);
  });
  it("waterparks are closed in January and open in July; skiing the other way round", () => {
    expect(isClosed(seasonFor("place-waterworld"), 1)).toBe(true);
    expect(isClosed(seasonFor("place-waterworld"), 7)).toBe(false);
    expect(isClosed(seasonFor("att-troodos-ski"), 7)).toBe(true);
    expect(isClosed(seasonFor("att-troodos-ski"), 2)).toBe(false);
  });
  it("uses the agreed wording and no em dashes", () => {
    expect(seasonLine(seasonFor("att-fasouri-watermania")!)).toBe("Seasonal and closed for winter. We'll post the opening date as soon as it's announced.");
    expect(seasonLine(seasonFor("place-waterworld")!)).toMatch(/^Closed for the season\. It usually opens in April\./);
    for (const s of Object.values(SEASONS)) expect(seasonLine(s)).not.toMatch(/—/);
  });
});
