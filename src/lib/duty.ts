import "server-only";
import raw from "../../data/duty.json";
import type { DestId, LL } from "./types";
import { DEST_CENTRE } from "./centres";
import { km, searchMaps } from "./geo";

/**
 * Pharmacies on duty, from the Ministry of Health's official rota (one file per district, converted by
 * scripts/content/duty.py). Only the pharmacy's own phone is kept, never the rota's home phone column.
 */
export interface DutyItem { am: string; a: string; t: string; te: string; near?: string; ph?: string; i?: string; ll?: LL; approx?: 1 }
interface DutyData { source: string; built: string; from: string; to: string; holidays: string[]; d: Record<string, Record<string, DutyItem[]>> }
const DUTY = raw as unknown as DutyData;

export const DUTY_SOURCE = DUTY.source;
export const DUTY_BUILT = DUTY.built;
export const DUTY_TO = DUTY.to;

export const DISTRICTS = [
  { id: "famagusta", name: "Ayia Napa, Protaras and Paralimni", short: "Famagusta district", dests: ["ayianapa", "protaras"] as DestId[] },
  { id: "paphos", name: "Paphos, Coral Bay and Polis", short: "Paphos district", dests: ["paphos", "akamas"] as DestId[] },
  { id: "larnaca", name: "Larnaca", short: "Larnaca district", dests: ["larnaca"] as DestId[] },
  { id: "limassol", name: "Limassol", short: "Limassol district", dests: ["limassol", "troodos"] as DestId[] },
  { id: "nicosia", name: "Nicosia", short: "Nicosia district", dests: ["nicosia", "troodos"] as DestId[] },
] as const;
export type DistrictId = (typeof DISTRICTS)[number]["id"];
export const getDistrict = (id: string) => DISTRICTS.find((d) => d.id === id);
/** The rota district(s) that cover one of our areas. Troodos villages fall in two districts. */
export const districtsFor = (dest: DestId) => DISTRICTS.filter((d) => (d.dests as readonly DestId[]).includes(dest));
export const dutyHref = (id: string) => `/pharmacies-on-duty/${id}`;

/** Today's date in Cyprus, as YYYY-MM-DD. */
export function cyToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Nicosia", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
export function addDays(iso: string, n: number) {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function fmtDay(iso: string, opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }) {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });
}

/** Duty opening hours for a date, as set by the rota rules. */
export function dutyHours(iso: string) {
  const dow = new Date(iso + "T12:00:00Z").getUTCDay();
  if (DUTY.holidays.includes(iso)) return { text: "08:00 to 22:00", why: "public holiday hours" };
  if (dow === 0) return { text: "08:00 to 22:00", why: "Sunday hours" };
  if (dow === 3 || dow === 6) return { text: "13:30 to 22:00", why: dow === 3 ? "Wednesday hours" : "Saturday hours" };
  return { text: "13:30 to 15:00 and 18:30 to 22:00", why: "weekday hours" };
}

export function dutyOn(district: string, iso: string): DutyItem[] | undefined {
  return DUTY.d[district]?.[iso];
}

/**
 * Google Maps search for the pharmacy itself. Most rota addresses have no exact pin, and a bare address
 * lands on whatever shop is nearby; "Φαρμακείο" + street + town puts the right pharmacy first (its phone
 * number matches the rota), so we use that for every card.
 */
export function dirFor(x: DutyItem) {
  const street = x.a.replace(/\s*\([^)]*\)/g, "").replace(/,?\s*κατ\.?\s*\d+/i, "").trim();
  return searchMaps(`Φαρμακείο ${street}${street.includes(x.t) ? "" : ` ${x.t}`}`);
}

/** How far a duty pharmacy is from each of our area centres in its district. */
export function distancesFor(x: DutyItem, district: string) {
  const d = getDistrict(district);
  if (!d || !x.ll) return [];
  return d.dests.filter((id) => id !== "troodos" || district === "limassol")
    .map((id) => ({ id, d: km(x.ll!, DEST_CENTRE[id]) }));
}

/** Days left in the published rota, counted from today. */
export const daysLeft = (today = cyToday()) => Math.round((Date.parse(DUTY.to) - Date.parse(today)) / 864e5);

const ON_ROTA = new Set(Object.values(DUTY.d).flatMap((days) => Object.values(days).flatMap((l) => l.map((x) => x.i)).filter(Boolean)) as string[]);
/** Whether a pharmacy from our register takes shifts on the published rota. */
export const onRota = (poiId: string) => ON_ROTA.has(poiId);
