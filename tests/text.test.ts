import { describe, expect, it } from "vitest";
import { norm, slugify, stars } from "@/lib/text";

describe("norm", () => {
  it("maps local spellings", () => {
    expect(norm("Larnaka")).toBe("larnaca");
    expect(norm("Agia Napa")).toBe("ayia napa");
    expect(norm("Lemesos marina")).toBe("limassol marina");
    expect(norm("Petra tou Romiou")).toBe("aphrodite");
  });
  it("only replaces whole words", () => {
    expect(norm("pafosbeach")).toBe("pafosbeach");
    expect(norm("protaras")).toBe("protaras");
  });
  it("transliterates Greek and drops accents", () => {
    expect(norm("Λάρνακα")).toBe("larnaka".replace("larnaka", "larnaca"));
    expect(norm("Café Nissí")).toBe("cafe nissi");
  });
  it("slugs and stars", () => {
    expect(slugify("Fig Tree Bay & Beach")).toBe("fig-tree-bay-and-beach");
    expect(stars("4*")).toBe("4-star");
    expect(stars("N/A")).toBe("");
  });
});
