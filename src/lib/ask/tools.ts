import "server-only";
import type { DestId, LL, Spot } from "../types";
import { BUS, DESTINATIONS, PLACES, POIS, BUSINESSES, busRoutesAt, getDest, isStay, spots } from "../data";
import { DEST_CENTRE } from "../centres";
import { nearestOf, byDistance } from "../around";
import { CLIMATE, MONTHS, cyTime, sunTimes } from "../weather";
import { parseForecast, type Step } from "../forecast";
import { DISTRICTS, cyToday, dirFor, districtsFor, dutyHours, dutyHref, dutyOn, fmtDay, DUTY_TO } from "../duty";
import { GUIDES, guideHref } from "../guides";
import { fmtD, howFar, km, walkMinutes, WALK_MAX_KM } from "../geo";
import { norm } from "../text";
import { cuisineLabel } from "../going";

/**
 * The assistant's tools. Each one reads our own data (official registers, the pharmacy rota, MET Norway),
 * so every answer can point to a page on the site. Results are kept small: the model pays per token.
 */

const AREAS = DESTINATIONS.map((d) => d.id).join(", ");
const KINDS = ["beach", "sight", "family", "eat", "night", "stay", "pharmacy", "health", "market", "bus"] as const;

export const TOOLS = [
  {
    name: "find_places",
    description: "Search our guide for named places: beaches, sights, hotels, restaurants, bars, cafes, pharmacies, supermarkets. Use for 'where is X', 'tell me about X', or lists like 'seafood in Paphos'. Returns names, short facts and the page link on welovecy.com.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Name or words to match, e.g. 'Nissi', 'Adams Beach', 'meze'. Leave empty to list by kind/area." },
        kind: { type: "string", enum: KINDS, description: "Optional filter." },
        area: { type: "string", description: `Optional area id: ${AREAS}.` },
        cuisine: { type: "string", description: "Optional for kind=eat: cypriot, greek, seafood, italian, asian, indian, middleeast, grill, burger, mexican, brunch, dessert, british, vegan." },
      },
    },
  },
  {
    name: "whats_near",
    description: "What is close to a place (or to where the visitor is staying): nearest beaches, restaurants, bars, supermarkets, pharmacies, clinics, bus stops, sights, hotels. Gives straight-line distance, walk or drive time and a taxi estimate.",
    input_schema: {
      type: "object",
      properties: {
        place: { type: "string", description: "Name of a hotel, beach or place. Use 'my base' for where the visitor said they are staying." },
        kind: { type: "string", enum: KINDS },
        limit: { type: "number", description: "How many, 1 to 8. Default 5." },
      },
      required: ["place", "kind"],
    },
  },
  {
    name: "distance",
    description: "How far between two places, with drive time and a taxi fare range. All figures are estimates.",
    input_schema: { type: "object", properties: { from: { type: "string" }, to: { type: "string" } }, required: ["from", "to"] },
  },
  {
    name: "pharmacies_on_duty",
    description: "Pharmacies on the official late duty rota (Ministry of Health) for a district and date, with hours, address and phone. Districts: famagusta (Ayia Napa, Protaras, Paralimni), paphos (incl. Coral Bay, Polis), larnaca, limassol, nicosia.",
    input_schema: {
      type: "object",
      properties: {
        district: { type: "string", enum: DISTRICTS.map((d) => d.id) },
        date: { type: "string", description: "YYYY-MM-DD in Cyprus time. Work out weekdays from today's date." },
      },
      required: ["district", "date"],
    },
  },
  {
    name: "weather",
    description: "Live weather now and the next days for an area (MET Norway), plus monthly averages (sea temperature, rain, sunshine) and today's sunset.",
    input_schema: {
      type: "object",
      properties: { area: { type: "string", description: `Area id: ${AREAS}.` }, month: { type: "number", description: "Optional 1-12 for monthly averages." } },
      required: ["area"],
    },
  },
  {
    name: "buses",
    description: "Bus stops near a place and the routes that call there (operator, route name, timetable link). Also airport bus services.",
    input_schema: {
      type: "object",
      properties: { place: { type: "string", description: "Place name or 'my base'." }, airport: { type: "boolean", description: "True for airport bus services." } },
    },
  },
  {
    name: "guides",
    description: "Search our written guides (buses, driving, airport transfers, beaches by area, public holidays, food, winter, kids, nightlife, things to do). Returns quick facts and the link.",
    input_schema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
  },
] as const;

export interface Ctx { base?: { n: string; ll: LL; href: string } | null }
type Args = Record<string, unknown>;
const S = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const url = (href: string) => `https://welovecy.com${href}`;
const areaName = (d: DestId) => getDest(d)?.name ?? d;
const asArea = (v: unknown): DestId | undefined => {
  const s = norm(S(v)).replace(/\s+/g, "");
  if (!s) return undefined;
  return DESTINATIONS.find((d) => d.id === s || norm(d.name).replace(/\s+/g, "") === s)?.id;
};

/** Everything a visitor might name, with a score for a query. Names first, then words anywhere. */
function score(name: string, q: string): number {
  const n = norm(name);
  if (!q) return 1;
  if (n === q) return 100;
  if (n.startsWith(q)) return 80;
  if (n.includes(q)) return 60;
  const words = q.split(" ").filter((w) => w.length > 2);
  if (!words.length) return 0;
  const hit = words.filter((w) => n.includes(w)).length;
  return hit === words.length ? 40 : hit ? 10 * hit : 0;
}

function resolve(name: string, ctx: Ctx): { n: string; ll: LL; href: string; key?: string } | null {
  const q = norm(name);
  if (!q) return null;
  if (ctx.base && (/\b(my )?(base|hotel|here|where i am|where im staying)\b/.test(q) || score(ctx.base.n, q) >= 60)) return { ...ctx.base };
  const pool = spots();
  let best: Spot | null = null, bs = 0;
  for (const s of pool) {
    const sc = score(s.n, q) + (s.k === "beach" || s.k === "sight" || s.k === "stay" ? 1 : 0);
    if (sc > bs) { bs = sc; best = s; }
  }
  if (best && bs >= 40) return { n: best.n, ll: best.ll, href: best.href, key: best.key };
  const dest = DESTINATIONS.find((d) => score(d.name, q) >= 60);
  if (dest) return { n: dest.name, ll: DEST_CENTRE[dest.id], href: `/destinations/${dest.id}` };
  return null;
}

function near(_ll: LL, d: number) {
  const walk = d <= WALK_MAX_KM ? `${walkMinutes(d)} min walk (estimate)` : howFar(d);
  return { distance: fmtD(d), getting_there: walk };
}

function findPlaces(a: Args) {
  const q = norm(S(a.query));
  const kind = S(a.kind);
  const area = asArea(a.area);
  const cz = S(a.cuisine);
  const out: { n: string; kind: string; area: string; facts: string; link: string; s: number }[] = [];
  const want = (k: string) => !kind || kind === k;
  for (const p of PLACES) {
    const k = p.cat.toLowerCase().includes("beach") ? "beach" : "sight";
    if (!want(k) || (area && p.dest !== area)) continue;
    const s = score(p.name, q) || (q && norm(p.intro).includes(q) ? 20 : 0);
    if (s) out.push({ n: p.name, kind: p.cat, area: areaName(p.dest), facts: p.intro.slice(0, 200), link: url(`/places/${p.slug}`), s: s + 5 });
  }
  for (const r of POIS) {
    if (!want(r.k) || (area && r.d !== area)) continue;
    const s = score(r.n, q) || (q && r.tw && norm(r.tw).includes(q) ? 15 : 0);
    if (s) out.push({ n: r.n, kind: r.k, area: [r.tw, areaName(r.d)].filter(Boolean).join(", "), facts: [r.a, r.ph ? `tel ${r.ph}` : "", r.hrs].filter(Boolean).join(" · "), link: url(`/listing/${encodeURIComponent(r.i)}`), s });
  }
  for (const b of BUSINESSES) {
    const k = isStay(b) ? "stay" : b.g === "night" ? "night" : "eat";
    if (b.vt === "cabaret" || !want(k) || (area && b.d !== area)) continue;
    if (cz && !b.cz?.includes(cz as never)) continue;
    const s = score(b.n, q) || (q && b.cz?.some((c) => norm(cuisineLabel(c)).includes(q)) ? 15 : 0) || (q && b.vt && b.vt.includes(q) ? 15 : 0);
    if (!s) continue;
    const facts = [b.l, b.c, b.cz?.map(cuisineLabel).join("/"), b.a, b.tw, b.p ? `tel ${b.p}` : "", b.in ? `inside a hotel${b.fl ? `, ${b.fl}` : ""}` : "", b.hrs].filter(Boolean).join(" · ");
    out.push({ n: b.n, kind: k, area: areaName(b.d), facts, link: url(`/listing/${encodeURIComponent(b.i)}`), s });
  }
  out.sort((x, y) => y.s - x.s || x.n.localeCompare(y.n));
  const total = out.length;
  return { total, results: out.slice(0, 8).map(({ s: _s, ...r }) => r), note: total > 8 ? "More on the site's area pages." : undefined };
}

function whatsNear(a: Args, ctx: Ctx) {
  const at = resolve(S(a.place), ctx);
  if (!at) return { error: `Couldn't find "${S(a.place)}". Ask which hotel, beach or town they mean.` };
  const n = Math.min(8, Math.max(1, Number(a.limit) || 5));
  const kind = S(a.kind) as Spot["k"];
  const list = nearestOf(at.ll, spots(), kind, n, at.key);
  return {
    from: { n: at.n, link: url(at.href) },
    results: list.map(({ s, d }) => ({ n: s.n, about: s.sub, ...near(s.ll, d), approx_pin: s.approx || undefined, link: url(s.href) })),
    see_all: url(`${at.href.startsWith("/listing/") ? at.href + "/around" : "/around"}`),
  };
}

function distance(a: Args, ctx: Ctx) {
  const f = resolve(S(a.from), ctx), t = resolve(S(a.to), ctx);
  if (!f || !t) return { error: `Couldn't find ${!f ? S(a.from) : S(a.to)}.` };
  const d = km(f.ll, t.ll);
  return { from: f.n, to: t.n, ...near(t.ll, d), note: "Straight-line distance; roads add a bit. Times and fares are estimates." };
}

function pharmacies(a: Args) {
  const dist = DISTRICTS.find((d) => d.id === S(a.district));
  const date = /^\d{4}-\d{2}-\d{2}$/.test(S(a.date)) ? S(a.date) : cyToday();
  if (!dist) return { error: "Unknown district" };
  const list = dutyOn(dist.id, date);
  if (!list) return { district: dist.name, date: fmtDay(date), error: `The published rota runs to ${fmtDay(DUTY_TO)}. Nothing for this date yet.`, link: url(dutyHref(dist.id)) };
  const h = dutyHours(date);
  return {
    district: dist.name, date: fmtDay(date), hours: `${h.text} (${h.why})`,
    pharmacies: list.map((x) => ({ town: x.te, address: x.a, landmark: x.near, phone: x.ph ? `+357 ${x.ph}` : undefined, map: dirFor(x) })),
    emergency: "112",
    source: "Ministry of Health duty rota",
    link: url(dutyHref(dist.id)),
  };
}

const UA = `welovecy.com ${process.env.WEATHER_CONTACT ?? "https://welovecy.com"}`;
async function weather(a: Args) {
  const id = asArea(a.area) ?? "ayianapa";
  const c = DEST_CENTRE[id];
  const out: Record<string, unknown> = { area: areaName(id), link: url("/weather") };
  try {
    const r = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${c[0].toFixed(3)}&lon=${c[1].toFixed(3)}`, { headers: { "User-Agent": UA }, next: { revalidate: 1800 } });
    if (r.ok) {
      const j = (await r.json()) as { properties: { timeseries: Step[] } };
      out.forecast = parseForecast(j.properties.timeseries, Date.now());
      out.forecast_source = "MET Norway";
    }
  } catch { out.forecast = "unavailable right now"; }
  const st = sunTimes(new Date(), c);
  out.today = { sunrise: cyTime(st.rise), sunset: cyTime(st.set) };
  const cl = CLIMATE[id];
  const m = Number(a.month);
  if (cl && m >= 1 && m <= 12) out.averages = { month: MONTHS[m - 1], high_c: cl.hi[m - 1], low_c: cl.lo[m - 1], rain_mm: cl.rain[m - 1], sea_c: cl.sea?.[m - 1], sun_hours: cl.sun[m - 1] };
  return out;
}

function buses(a: Args, ctx: Ctx) {
  if (a.airport) {
    return { services: BUS.airport.map((s) => ({ airport: s.air, operator: s.op, route: s.route, number: s.num, change: s.change, board: s.board, timetable: s.web, book: s.book, phone: s.ph })), link: url("/buses"), source: BUS.source.t };
  }
  const at = resolve(S(a.place), ctx);
  if (!at) return { error: "Which hotel, beach or town?", link: url("/buses") };
  const stops = nearestOf(at.ll, spots(), "bus", 3, at.key);
  const keys = [...new Set(stops.flatMap(({ s }) => BUS.stops.find((x) => x.i === s.key)?.rk ?? []))];
  return {
    from: at.n,
    stops: stops.map(({ s, d }) => ({ n: s.n, ...near(s.ll, d), routes: s.rt, link: url(s.href) })),
    routes: busRoutesAt(keys).slice(0, 8).map((r) => ({ route: r.r, name: r.l, operator: r.op, timetable: r.web })),
    source: BUS.source.t,
  };
}

function guides(a: Args) {
  const q = norm(S(a.query));
  const words = q.split(" ").filter((w) => w.length > 2);
  const scored = GUIDES.map((g) => {
    const hay = norm(`${g.title} ${g.description} ${g.topic}`);
    return { g, s: words.filter((w) => hay.includes(w)).length };
  }).filter((x) => x.s).sort((x, y) => y.s - x.s).slice(0, 3);
  return { results: scored.map(({ g }) => ({ title: g.title, about: g.description, quick: g.quick.slice(0, 6), link: url(guideHref(g.slug)), updated: g.updated })) };
}

export async function runTool(name: string, args: Args, ctx: Ctx): Promise<unknown> {
  switch (name) {
    case "find_places": return findPlaces(args);
    case "whats_near": return whatsNear(args, ctx);
    case "distance": return distance(args, ctx);
    case "pharmacies_on_duty": return pharmacies(args);
    case "weather": return weather(args);
    case "buses": return buses(args, ctx);
    case "guides": return guides(args);
    default: return { error: "unknown tool" };
  }
}

/** For the area list in the system prompt. */
export const AREA_LINES = DESTINATIONS.map((d) => `${d.id} = ${d.name}${districtsFor(d.id).length ? ` (pharmacy district: ${districtsFor(d.id).map((x) => x.id).join(" or ")})` : ""}`).join("\n");
export { byDistance };
