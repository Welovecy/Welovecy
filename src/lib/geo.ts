import type { LL } from "./types";

/** Great-circle distance in km. */
export function km(a: LL, b: LL): number {
  const R = 6371, t = Math.PI / 180;
  const dLat = (b[0] - a[0]) * t, dLon = (b[1] - a[1]) * t;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * t) * Math.cos(b[0] * t) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function fmtD(d: number): string {
  if (d < 1) return Math.max(50, Math.round((d * 1000) / 50) * 50) + " m";
  return (d < 10 ? d.toFixed(1) : String(Math.round(d))) + " km";
}

/** Road distance is roughly 1.25 to 1.3 times the straight line. */
export const WALK_FACTOR = 1.25;
export const ROAD_FACTOR = 1.3;
/** Urban taxi, day tariff (Visit Cyprus, reviewed 18 Nov 2026). */
export const TAXI = { start: 3.8, perKm: 0.95 };

export function walkMinutes(d: number): number {
  return Math.max(1, Math.round(((d * WALK_FACTOR) / 5) * 60));
}
export function taxiEstimate(d: number): number {
  return Math.round(TAXI.start + TAXI.perKm * d * ROAD_FACTOR);
}
/** Night tariffs, waiting and detours push fares up, so we show our day figure up to 25% more. */
export const TAXI_MARGIN = 1.25;
export function taxiRange(d: number): [number, number] {
  const lo = taxiEstimate(d);
  return [lo, Math.max(lo + 1, Math.ceil(lo * TAXI_MARGIN))];
}

/** Beyond this a walk stops being the answer and we give the drive. About 15 minutes on foot. */
export const WALK_MAX_KM = 1.2;

/** Rough door-to-door drive: road distance at town speeds for short hops, faster on longer runs. */
export function driveMinutes(d: number): number {
  const road = d * ROAD_FACTOR;
  // first 3 km at 30 km/h in town, the next 7 at 45, the rest at 60, so further is never quicker
  const hours = Math.min(road, 3) / 30 + Math.min(Math.max(road - 3, 0), 7) / 45 + Math.max(road - 10, 0) / 60;
  return Math.max(3, Math.round(hours * 60) + 1);
}

/** "350 m · 5 min walk" for short walks, then "6.4 km · 12 min drive · €12–15 by taxi (estimate)". */
export function howFar(d: number): string {
  if (d <= WALK_MAX_KM) return `${fmtD(d)} · ${walkMinutes(d)} min walk`;
  const [lo, hi] = taxiRange(d);
  return `${fmtD(d)} · ${driveMinutes(d)} min drive · €${lo}–${hi} by taxi (estimate)`;
}

export function directionsTo(ll: LL): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${ll[0]},${ll[1]}`;
}
export function searchMaps(q: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

/** Republic of Cyprus land boxes used for data checks. Generous but excludes the north. */
export const ROC_SOUTH_LIMIT_LAT = 35.2;
