import raw from "@data/events.json";
import type { DestId, LL } from "./types";

/* Date helpers (kept here, not imported from duty.ts, so this file is safe in the browser). */
export function cyToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Nicosia", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
export function addDays(iso: string, n: number) {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * Public events and festivals. Every entry has a source; "dates_tbc" entries show the usual timing
 * until the organiser publishes dates. Dates are YYYY-MM-DD in Cyprus time.
 */
export type EventType = "festival" | "christmas" | "music" | "show" | "market" | "sport" | "other";
export type District = "nicosia" | "limassol" | "larnaca" | "paphos" | "famagusta" | "all";
export interface CyEvent {
  id: string; name: string; type: EventType; status: "confirmed" | "dates_tbc" | "cancelled";
  start?: string; end?: string; time?: string; recurrence?: string; usual?: string;
  town: string; district: District; venue?: string; address?: string; ll?: LL;
  organiser?: string; organiserUrl?: string; ticketUrl?: string; price?: string;
  desc: string; source: string; sourceName: string; checked: string; guide?: string;
}

export const EVENTS = (raw as unknown as { events: CyEvent[] }).events.filter((e) => e.status !== "cancelled");

export const TYPE_LABEL: Record<EventType, string> = {
  festival: "Festival", christmas: "Christmas", music: "Music", show: "Show", market: "Market", sport: "Sport", other: "Event",
};
export const DISTRICT_LABEL: Record<Exclude<District, "all">, string> = {
  famagusta: "Ayia Napa & Protaras", larnaca: "Larnaca", limassol: "Limassol", paphos: "Paphos", nicosia: "Nicosia",
};
export const DISTRICT_OF: Record<DestId, District> = {
  ayianapa: "famagusta", protaras: "famagusta", paphos: "paphos", akamas: "paphos", limassol: "limassol", larnaca: "larnaca", nicosia: "nicosia", troodos: "limassol",
};
/** Festivals tab: the cultural side. */
export const FESTIVAL_TYPES: EventType[] = ["festival", "christmas"];

const endOf = (e: CyEvent) => e.end || e.start || "";

/** Dated events that haven't finished yet, soonest first. */
export function upcoming(today = cyToday()): CyEvent[] {
  return EVENTS.filter((e) => e.start && endOf(e) >= today).sort((a, b) => a.start!.localeCompare(b.start!));
}
/** Announced but not yet dated. */
export const datesTbc = () => EVENTS.filter((e) => e.status === "dates_tbc" || !e.start);

export function overlaps(e: CyEvent, from: string, to: string) {
  return !!e.start && e.start <= to && endOf(e) >= from;
}

/** Friday to Sunday of this weekend (or the coming one), in Cyprus time. */
export function weekend(today = cyToday()): [string, string] {
  const dow = new Date(today + "T12:00:00Z").getUTCDay(); // 0 Sun
  if (dow === 0) return [addDays(today, -2), today];
  if (dow === 6) return [addDays(today, -1), addDays(today, 1)];
  const fri = addDays(today, (5 - dow + 7) % 7);
  return [fri, addDays(fri, 2)];
}

export function whenText(e: CyEvent): string {
  if (!e.start) return e.usual ? `Dates to be announced · ${e.usual}` : "Dates to be announced";
  const f = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { ...o, timeZone: "UTC" });
  const s = e.start, en = e.end && e.end !== e.start ? e.end : null;
  if (!en) return f(s, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const sameMonth = s.slice(0, 7) === en.slice(0, 7);
  return sameMonth
    ? `${f(s, { day: "numeric" })} to ${f(en, { day: "numeric", month: "short", year: "numeric" })}`
    : `${f(s, { day: "numeric", month: "short" })} to ${f(en, { day: "numeric", month: "short", year: "numeric" })}`;
}

/** One calendar entry, for "Add to calendar". All-day unless a start time is given. */
export function ics(e: CyEvent): string {
  const d = (iso: string) => iso.replace(/-/g, "");
  const esc = (s: string) => s.replace(/[\\,;]/g, (c) => "\\" + c).replace(/\n/g, "\\n");
  const end = addDays(endOf(e), 1);
  const where = [e.venue, e.address, e.town].filter(Boolean).join(", ");
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//We Love Cyprus//welovecy.com//EN", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT", `UID:${e.id}@welovecy.com`, `DTSTAMP:${d(e.checked)}T000000Z`,
    `DTSTART;VALUE=DATE:${d(e.start!)}`, `DTEND;VALUE=DATE:${d(end)}`,
    `SUMMARY:${esc(e.name)}`, `LOCATION:${esc(where)}`, `DESCRIPTION:${esc(`${e.desc}\n\nMore: https://welovecy.com/explore/events#${e.id}`)}`,
    "END:VEVENT", "END:VCALENDAR", "",
  ].join("\r\n");
}

export const eventMap = (e: CyEvent) =>
  e.ll ? `https://www.google.com/maps/dir/?api=1&destination=${e.ll[0]},${e.ll[1]}`
    : e.venue ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([e.venue, e.address, e.town, "Cyprus"].filter(Boolean).join(", "))}` : undefined;
