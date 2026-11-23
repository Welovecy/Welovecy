import climate from "@data/climate.json";
import type { DestId, LL } from "./types";

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const MON = MONTHS.map((m) => m.slice(0, 3));

export interface Climate { station: string; hi: number[]; lo: number[]; rain: number[]; sea: number[] | null; seaStation: string | null; sun: number[]; sunStation: string }
export const CLIMATE = climate.areas as Record<DestId, Climate>;
export const CLIMATE_SOURCE = climate.source;

/** What the live forecast endpoint returns. */
export interface Now {
  at: string;
  t: number;
  wind: number;
  dir: number;
  sym: string;
  rain1h: number;
  days: { date: string; hi: number; lo: number; sym: string; rain: number }[];
}

/** MET Norway symbol codes, e.g. "partlycloudy_day", grouped into a handful of plain words. */
export function symbolInfo(code: string): { icon: "sun" | "moon" | "part" | "partn" | "cloud" | "rain" | "storm" | "snow" | "fog"; label: string } {
  const night = code.endsWith("_night");
  const c = code.replace(/_(day|night|polartwilight)$/, "");
  if (c.includes("thunder")) return { icon: "storm", label: "Thunderstorms" };
  if (c.includes("snow")) return { icon: "snow", label: "Snow" };
  if (c.includes("sleet")) return { icon: "snow", label: "Sleet" };
  if (c.includes("heavyrain")) return { icon: "rain", label: "Heavy rain" };
  if (c.includes("lightrain")) return { icon: "rain", label: "Light rain" };
  if (c.includes("rain")) return { icon: "rain", label: c.includes("showers") ? "Showers" : "Rain" };
  if (c === "fog") return { icon: "fog", label: "Fog" };
  if (c === "cloudy") return { icon: "cloud", label: "Cloudy" };
  if (c === "partlycloudy") return { icon: night ? "partn" : "part", label: "Partly cloudy" };
  if (c === "fair") return { icon: night ? "partn" : "part", label: night ? "Mostly clear" : "Mostly sunny" };
  return { icon: night ? "moon" : "sun", label: night ? "Clear" : "Sunny" };
}

/** Wind in m/s as words a holidaymaker understands, roughly following the Beaufort scale. */
export function windWords(ms: number): string {
  if (ms < 1.6) return "Calm";
  if (ms < 3.4) return "Light breeze";
  if (ms < 5.5) return "Gentle breeze";
  if (ms < 8) return "Breezy";
  if (ms < 10.8) return "Windy";
  if (ms < 13.9) return "Very windy";
  return "Gale";
}

export const compass = (deg: number) => ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"][Math.round(((deg % 360) / 45)) % 8];

/** Sunrise and sunset for a date and place (NOAA approximation, accurate to a minute or two). Returns UTC Dates. */
export function sunTimes(date: Date, [lat, lng]: LL): { rise: Date; set: Date } {
  const rad = Math.PI / 180;
  const day = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const n = Math.floor((day - Date.UTC(2000, 0, 1, 12)) / 864e5) + 1;
  const jStar = n - lng / 360;
  const M = (357.5291 + 0.98560028 * jStar) % 360;
  const C = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad);
  const L = (M + C + 180 + 102.9372) % 360;
  const jTransit = 2451545 + jStar + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * L * rad);
  const dec = Math.asin(Math.sin(L * rad) * Math.sin(23.44 * rad));
  const cosH = (Math.sin(-0.833 * rad) - Math.sin(lat * rad) * Math.sin(dec)) / (Math.cos(lat * rad) * Math.cos(dec));
  const H = Math.acos(Math.max(-1, Math.min(1, cosH))) / rad;
  const toDate = (j: number) => new Date((j - 2440587.5) * 864e5);
  return { rise: toDate(jTransit - H / 360), set: toDate(jTransit + H / 360) };
}

export const cyTime = (d: Date) => d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Nicosia" });
export const cyDay = (iso: string) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "short", timeZone: "Asia/Nicosia" });

/** A one-line verdict on a month, for "when are you coming?". */
export function monthVerdict(c: Climate, m: number): string {
  const hi = c.hi[m], sea = c.sea?.[m];
  if (sea != null && sea >= 24 && hi >= 27) return "Beach weather";
  if (sea != null && sea >= 22 && hi >= 24) return "Warm, good for swimming";
  if (hi >= 30) return "Hot";
  if (hi >= 22) return "Warm and sunny";
  if (hi >= 17) return "Mild, cooler evenings";
  if (hi >= 10) return "Cool, rain possible";
  return "Cold, snow possible";
}
