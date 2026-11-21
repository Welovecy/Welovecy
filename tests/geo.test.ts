import { describe, expect, it } from "vitest";
import { driveMinutes, fmtD, howFar, km, taxiEstimate, walkMinutes } from "@/lib/geo";

describe("geo", () => {
  it("measures Larnaca to Ayia Napa at about 36 km in a straight line", () => {
    const d = km([34.9137, 33.6385], [34.9875, 33.9995]);
    expect(d).toBeGreaterThan(33);
    expect(d).toBeLessThan(39);
  });
  it("is zero for the same point and symmetric", () => {
    expect(km([35, 33], [35, 33])).toBe(0);
    expect(km([34.7, 32.4], [35.1, 33.9])).toBeCloseTo(km([35.1, 33.9], [34.7, 32.4]), 9);
  });
  it("formats distances", () => {
    expect(fmtD(0.01)).toBe("50 m");
    expect(fmtD(0.349)).toBe("350 m");
    expect(fmtD(2.345)).toBe("2.3 km");
    expect(fmtD(12.6)).toBe("13 km");
  });
  it("walks short trips and gives the drive for longer ones", () => {
    expect(walkMinutes(1)).toBe(15);
    expect(howFar(1)).toBe("1.0 km · 15 min walk");
    expect(taxiEstimate(10)).toBe(16);
    expect(driveMinutes(1.5)).toBe(5);
    expect(driveMinutes(14.3)).toBe(25);
    for (let d = 1.3; d < 15; d += 0.1) expect(driveMinutes(d + 0.1)).toBeGreaterThanOrEqual(driveMinutes(d));
    expect(howFar(10)).toBe(`10 km · ${driveMinutes(10)} min drive · about €16 by taxi`);
  });
});
