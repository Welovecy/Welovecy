import "server-only";
import { isClosed, seasonFor, seasonLine } from "@/lib/season";
import type { DestId, LL, Spot } from "../types";
import { BUS, DESTINATIONS, PLACES, POIS, BUSINESSES, bizDirections, busRoutesAt, getBusiness, getDest, getPlace, getPoi, isStay, listingHref, photoFor, poiDirections, spots } from "../data";
import { symbolInfo } from "../weather";
import { DEST_CENTRE } from "../centres";
import { nearestOf, byDistance } from "../around";
import { CLIMATE, MONTHS, cyTime, sunTimes } from "../weather";
import { parseForecast, type Step } from "../forecast";
import { DISTRICTS, cyToday, dirFor, districtsFor, dutyHours, dutyHref, dutyOn, fmtDay, DUTY_TO } from "../duty";
import { GUIDES, guideHref } from "../guides";
import { fmtD, howFar, km, walkMinutes, WALK_MAX_KM } from "../geo";
import { norm } from "../text";
import { cuisineLabel } from "../going";
import sitemap from "../../app/sitemap";
import aliasJson from "@data/aliases.json";
const ALIAS = (aliasJson as { aliases: Record<string, string[]> }).aliases;
import { EVENTS, datesTbc, overlaps, whenText } from "../events";
import { addDays as addD } from "../duty";
import { isIndoor } from "../indoor";
import { KNOW_CHECKED, KNOW_HREF, searchFacts } from "../knowledge";
import { PARTNERS, PARTNER_LABEL, partnerFor, partnerForGuide, partnerHref, type PartnerService, type Stay } from "../partners";

/**
 * The assistant's tools. Each one reads our own data (official registers, the pharmacy rota, MET Norway),
 * so every answer can point to a page on the site. Results are kept small: the model pays per token.
 */

const AREAS = DESTINATIONS.map((d) => d.id).join(", ");
const KINDS = ["beach", "sight", "family", "activity", "nature", "info", "eat", "night", "stay", "pharmacy", "health", "market", "bus"] as const;

export const TOOLS = [
  {
    name: "find_places",
    description: "Search our guide for named places: beaches, sights, museums, walks and nature trails, tourist information offices, hotels, restaurants, bars, cafes, pharmacies, supermarkets. Use for 'where is X', 'tell me about X', or lists like 'seafood in Paphos'. Returns names, short facts and the page link on welovecy.com.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Name or words to match, e.g. 'Nissi', 'Adams Beach', 'meze'. Leave empty to list by kind/area." },
        kind: { type: "string", enum: KINDS, description: "Optional filter." },
        area: { type: "string", description: `Optional area id: ${AREAS}.` },
        indoor: { type: "boolean", description: "True for indoor places only (museums, galleries, aquarium, cinemas, malls, theatres): use for rain, heat or 'something indoors'. Combine with area." },
        cuisine: { type: "string", description: "Optional for kind=eat: cypriot, greek, seafood, italian, asian, indian, middleeast, grill, burger, mexican, brunch, dessert, british, vegan." },
      },
    },
  },
  {
    name: "whats_near",
    description: "What is close to a place (or to where the visitor is staying): nearest beaches, restaurants, bars, supermarkets, pharmacies, clinics, bus stops, sights, walks, tourist offices, hotels. Gives straight-line distance, walk or drive time and a taxi estimate.",
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
    name: "events",
    description: "Public events and festivals in Cyprus from our checked list (festivals, Christmas markets, music, shows, markets, sport), each with its official source. Use for 'what's on', 'this weekend', festivals, Christmas, concerts. Work out dates from today's date.",
    input_schema: {
      type: "object",
      properties: {
        from: { type: "string", description: "YYYY-MM-DD, default today" },
        to: { type: "string", description: "YYYY-MM-DD, default 60 days after from" },
        district: { type: "string", enum: ["famagusta", "larnaca", "limassol", "paphos", "nicosia"], description: "Optional. famagusta = Ayia Napa, Protaras, Paralimni." },
        type: { type: "string", enum: ["festival", "christmas", "music", "show", "market", "sport", "other"] },
      },
    },
  },
  {
    name: "transfer_partner",
    description: "Call for ANY request about getting to or from an airport, an airport transfer or pickup, or a taxi. Says whether one of our advertising partners covers where the visitor is staying. Only mention a transfer company if this tool returns it.",
    input_schema: {
      type: "object",
      properties: {
        service: { type: "string", enum: ["airport_transfer", "local_taxi"], description: "airport_transfer for airport pickups and drop-offs; local_taxi for taxis within an area." },
        staying: { type: "string", description: "Where the visitor is staying: hotel, villa area, village or town, as they said it. 'my base' if they set their hotel on the site. Not the airport." },
      },
      required: ["service"],
    },
  },
  {
    name: "know",
    description: "Checked facts visitors ask about, each with its source: passports, visas and Schengen, healthcare and the GHIC/EHIC, heat, tap water, lifeguards, sea quality, turtle beaches, drinking age, smoking, e-scooters, drones, time zone, shop hours and Sundays, language and phrases, church dress, phone roaming, and the best time to visit. Use it for any general 'what should I know' question.",
    input_schema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
  },
  {
    name: "site_pages",
    description: "Find any page on welovecy.com by topic when the other tools don't cover it: eat and drink lists by area and cuisine, hotels near a beach, airport distances, weather by month, practical info, essentials, UNESCO sites, wine routes, things to do, the quiz. Returns page links.",
    input_schema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
  },
  {
    name: "guides",
    description: "Search our written guides (airports to each resort, buses, driving, taxis and fares, beaches by area, public holidays, food, winter, kids, nightlife, things to do). Returns quick facts, the full text of the best match, and the link. Always use it for getting from an airport.",
    input_schema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
  },
] as const;

export interface Ctx { base?: { n: string; ll: LL; href: string } | null; page?: string; /** earlier answers in this conversation, so a partner is recommended once */ earlier?: string }
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
    const sc = Math.max(score(s.n, q), ...(ALIAS[s.key] ?? []).map((a) => score(a, q))) + (s.k === "beach" || s.k === "sight" || s.k === "stay" ? 1 : 0);
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
  const indoor = a.indoor === true;
  const out: { n: string; kind: string; area: string; facts: string; link: string; s: number }[] = [];
  const want = (k: string) => !kind || kind === k;
  for (const p of indoor ? [] : PLACES) {
    const k = p.cat.toLowerCase().includes("beach") ? "beach" : "sight";
    if (!want(k) || (area && p.dest !== area)) continue;
    const s = score(p.name, q) || (q && norm(p.intro).includes(q) ? 20 : 0);
    if (s) out.push({ n: p.name, kind: p.cat, area: areaName(p.dest), facts: (p.notice ? `NOTICE: ${p.notice.t} ` : "") + (isClosed(seasonFor(`place-${p.slug}`)) ? `NOTICE: ${seasonLine(seasonFor(`place-${p.slug}`)!)} ` : "") + p.intro.slice(0, 200), link: url(`/places/${p.slug}`), s: s + 5 });
  }
  for (const r of POIS) {
    if (!want(r.k) || (area && r.d !== area) || (indoor && !isIndoor(r.cat))) continue;
    const s = Math.max(score(r.n, q), ...(r.alt ? r.alt.split(";").map((x) => score(x, q)) : [0])) || (q && r.cat && norm(r.cat).includes(q) ? 20 : 0) || (q && r.tw && norm(r.tw).includes(q) ? 15 : 0);
    if (s) out.push({ n: r.n, kind: r.k, area: [r.tw, areaName(r.d)].filter(Boolean).join(", "), facts: [r.notice ? `NOTICE: ${r.notice}` : "", isClosed(seasonFor(r.i)) ? `NOTICE: ${seasonLine(seasonFor(r.i)!)}` : "", r.cat, r.len ? `${r.len}${r.grade ? `, difficulty grade ${r.grade} (1 easiest to 3 hardest)` : ""}` : "", r.time ? `about ${r.time}` : "", r.shape === "one way" ? "one-way walk: plan the way back" : r.shape === "loop" ? "loop" : "", r.desc, r.a, r.ph ? `tel ${r.ph}` : "", r.hrs, r.hrsNote, r.web ? `website ${r.web}` : "", r.srcs && !r.hrs ? "opening hours not verified" : ""].filter(Boolean).join(" · "), link: url(`/listing/${encodeURIComponent(r.i)}`), s });
  }
  for (const b of indoor ? [] : BUSINESSES) {
    const k = isStay(b) ? "stay" : b.g === "night" ? "night" : "eat";
    if (b.vt === "cabaret" || !want(k) || (area && b.d !== area)) continue;
    if (cz && !b.cz?.includes(cz as never)) continue;
    const s = Math.max(score(b.n, q), ...(ALIAS[b.i] ?? []).map((a) => score(a, q))) || (q && b.cz?.some((c) => norm(cuisineLabel(c)).includes(q)) ? 15 : 0) || (q && b.vt && b.vt.includes(q) ? 15 : 0);
    if (!s) continue;
    const facts = [b.l, b.c, b.cz?.map(cuisineLabel).join("/"), b.a, b.tw, b.p ? `tel ${b.p}` : "", b.in ? `inside a hotel${b.fl ? `, ${b.fl}` : ""}` : "", b.hrs].filter(Boolean).join(" · ");
    out.push({ n: b.n, kind: k, area: areaName(b.d), facts, link: url(`/listing/${encodeURIComponent(b.i)}`), s });
  }
  out.sort((x, y) => y.s - x.s || x.n.localeCompare(y.n));
  const total = out.length;
  return { total, results: out.slice(0, 8).map(({ s: _s, ...r }) => r), note: total > 8 ? "More on the site's area pages." : undefined };
}

/** Venue details worth knowing when choosing: type, cuisines, where in a hotel, opening hours. */
function aboutBiz(id: string): string | undefined {
  const b = getBusiness(id);
  if (!b) return undefined;
  const host = b.in ? getBusiness(b.in)?.n : undefined;
  const park = b.at ? POIS.find((p) => p.i === b.at)?.n : undefined;
  return [b.vt ?? b.l, b.cz?.map(cuisineLabel).join("/"), host ? `inside ${host}${b.fl ? `, ${b.fl}` : ""}` : "", park ? `inside ${park}` : "", b.hrs].filter(Boolean).join(" · ");
}

function whatsNear(a: Args, ctx: Ctx) {
  const at = resolve(S(a.place), ctx);
  if (!at) return { error: `Couldn't find "${S(a.place)}". Ask which hotel, beach or town they mean.` };
  const n = Math.min(8, Math.max(1, Number(a.limit) || 5));
  const kind = S(a.kind) as Spot["k"];
  const list = nearestOf(at.ll, spots(), kind, n, at.key);
  return {
    from: { n: at.n, link: url(at.href) },
    results: list.map(({ s, d }) => ({ n: s.n, about: aboutBiz(s.key) ?? s.sub, ...near(s.ll, d), approx_pin: s.approx || undefined, link: url(s.href) })),
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

function know(a: Args) {
  const facts = searchFacts(S(a.query));
  if (!facts.length) return { facts: [], note: "No checked fact for this. Try guides or site_pages, or say you don't know.", page: url(KNOW_HREF) };
  return { checked: KNOW_CHECKED, page: url(KNOW_HREF), facts: facts.map((f) => ({ fact: f.t, sources: f.src.map((x) => x.t + " " + x.u), link: url(`${KNOW_HREF}#${f.id}`) })) };
}

function guides(a: Args, ctx: Ctx) {
  const q = norm(S(a.query));
  const words = q.split(" ").filter((w) => w.length > 2);
  const scored = GUIDES.map((g) => {
    const hay = norm(`${g.title} ${g.description} ${g.topic}`);
    return { g, s: words.filter((w) => hay.includes(w)).length };
  }).filter((x) => x.s).sort((x, y) => y.s - x.s).slice(0, 3);
  // The best match comes with its full text (buses, fares, times live in the body, not just the quick facts).
  const plain = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
  const results = scored.map(({ g }, i) => ({ title: g.title, about: g.description, quick: g.quick.slice(0, 6), text: i === 0 ? plain(g.html).slice(0, 3200) : undefined, link: url(guideHref(g.slug)), updated: g.updated }));
  // An airport guide asked about with a resort the partner covers: hand over the partner check too, in code,
  // so the recommendation doesn't depend on a second tool call. An airport name alone never matches.
  const top = scored[0]?.g;
  const p = top && partnerForGuide(top.slug);
  const stay = S(a.query).replace(/\b(larnaca|larnaka|paphos|pafos)\s+airport\b/gi, " ");
  const hit = p && partnerFor("airport_transfer", { text: stay });
  return hit ? { results, ...transferPartner({ service: "airport_transfer", staying: stay }, ctx) } : { results };
}

/** Every page in the sitemap, so new sections are searchable the moment they ship. */
let pageIndex: { path: string; words: string }[] | null = null;
function sitePages(a: Args) {
  pageIndex ||= sitemap().map((e) => { const path = new URL(e.url).pathname; return { path, words: norm(path.replace(/[/-]+/g, " ")) }; })
    .filter((x) => !x.path.startsWith("/listing/"));
  const words = norm(S(a.query)).split(" ").filter((w) => w.length > 2);
  const hits = pageIndex.map((x) => ({ x, s: words.filter((w) => x.words.includes(w)).length })).filter((h) => h.s).sort((p, q) => q.s - p.s || p.x.path.length - q.x.path.length);
  return { results: hits.slice(0, 6).map((h) => ({ page: h.x.words || "home", link: url(h.x.path) })) };
}

function events(a: Args) {
  const iso = (v: unknown) => (/^\d{4}-\d{2}-\d{2}$/.test(S(v)) ? S(v) : "");
  const from = iso(a.from) || cyToday();
  const to = iso(a.to) || addD(from, 60);
  const district = S(a.district), type = S(a.type);
  const fit = (e: (typeof EVENTS)[number]) => (!district || e.district === district || e.district === "all") && (!type || e.type === type);
  const dated = EVENTS.filter((e) => fit(e) && overlaps(e, from, to)).sort((x, y) => x.start!.localeCompare(y.start!));
  const tbc = datesTbc().filter(fit);
  const row = (e: (typeof EVENTS)[number]) => ({ n: e.name, type: e.type, when: whenText(e), time: e.time, town: e.town, about: e.desc, price: e.price, organiser: e.organiserUrl, tickets: e.ticketUrl, source: e.source, link: url(`/explore/events#${e.id}`) });
  return {
    from, to, results: dated.slice(0, 10).map(row), dates_not_announced: tbc.slice(0, 5).map(row),
    note: dated.length ? undefined : "Nothing listed for these dates yet. Our events list is growing; suggest the events page or asking in the Facebook group.",
    link: url(type === "festival" || type === "christmas" ? "/explore/festivals" : "/explore/events"),
  };
}

export async function runTool(name: string, args: Args, ctx: Ctx): Promise<unknown> {
  switch (name) {
    case "find_places": return findPlaces(args);
    case "whats_near": return whatsNear(args, ctx);
    case "distance": return distance(args, ctx);
    case "pharmacies_on_duty": return pharmacies(args);
    case "weather": return weather(args);
    case "buses": return buses(args, ctx);
    case "guides": return guides(args, ctx);
    case "know": return know(args);
    case "site_pages": return sitePages(args);
    case "events": return events(args);
    case "transfer_partner": return transferPartner(args, ctx);
    default: return { error: "unknown tool" };
  }
}

/* ---------- Advertising partners: code decides eligibility, by where the visitor is staying ---------- */

function stayFrom(text: string, ctx: Ctx): Stay | null {
  const q = norm(text);
  // "my hotel" alone means the hotel they set on the site; "our villa in Peyia" is a place to look up.
  const useBase = !q || /^((my|our|the) )?(base|hotel|villa|apartment|accommodation|here)$|^where (i|we) (am|are|m|re) staying$/.test(q);
  const r = useBase ? (ctx.base ? { ...ctx.base, key: undefined as string | undefined } : null) : resolve(text, ctx);
  const stay: Stay = { text: useBase ? "" : text };
  if (!r) return q && !useBase ? stay : null;
  stay.ll = r.ll;
  const lm = /^\/listing\/([^/]+)$/.exec(r.href);
  const pm = /^\/places\/([^/]+)$/.exec(r.href);
  const dm = /^\/destinations\/([a-z]+)$/.exec(r.href);
  if (lm) {
    const id = decodeURIComponent(lm[1]);
    const b = getBusiness(id), p = getPoi(id);
    if (b) { stay.town = b.tw; stay.area = b.d; }
    else if (p) { stay.town = p.tw; stay.area = p.d; }
  } else if (pm) {
    const pl = getPlace(pm[1]); if (pl) stay.area = pl.dest;
  } else if (dm) stay.area = dm[1] as DestId;
  return stay;
}

function transferPartner(a: Args, ctx: Ctx) {
  const service = (S(a.service) === "local_taxi" ? "local_taxi" : "airport_transfer") as PartnerService;
  const stay = stayFrom(S(a.staying), ctx);
  if (!stay) return { partner: null, ask: "Ask where they are staying (town, area or hotel) before suggesting any transfer company. Meanwhile give the general options." };
  const p = partnerFor(service, stay);
  if (!p) return { partner: null, note: "No partner covers this. Give independent options only (airport bus or shuttle, the taxi rank, booking a transfer in general) and don't name any transfer or taxi company." };
  if (ctx.earlier && ctx.earlier.toLowerCase().includes(p.name.toLowerCase())) {
    return { partner: null, already_mentioned: p.name, note: `You already introduced ${p.name} in this conversation. Don't recommend it again; refer back in a few words only if it helps.` };
  }
  return {
    partner: {
      name: p.name, label: PARTNER_LABEL, what: p.kind, covers: p.coverage.label, about: p.intro,
      airports: p.airports ?? undefined, phone: p.phone ?? undefined, book: p.book, website: p.web, page: url(partnerHref(p.id)),
      guide: p.guides[0] ? url(guideHref(p.guides[0])) : undefined,
    },
    how_to_mention: "After the independent options, one short natural line: name them as our advertising partner for this area, link their page, say they book and confirm the price directly. No prices, no promises about availability or times, never 'best'.",
  };
}

/* ---------- Links in answers: only pages that exist ---------- */
let known: Set<string> | null = null;
function knownPaths(): Set<string> {
  if (known) return known;
  known = new Set(sitemap().map((e) => new URL(e.url).pathname));
  for (const b of BUSINESSES) known.add(listingHref(b.i));
  for (const r of POIS) known.add(listingHref(r.i));
  for (const p of PARTNERS) known.add(partnerHref(p.id));
  for (const x of ["/credits", "/list-your-business", "/search", "/saved", "/essentials", "/privacy", "/about"]) known.add(x);
  for (const st of BUS.stops) known.add(`/buses/stop/${st.i}`);
  for (const d of DESTINATIONS) { known.add(`/essentials/${d.id}`); for (const k of ["pharmacy", "health", "market", "info"]) known.add(`/essentials/${d.id}/${k}`); known.add(`/eat-drink/${d.id}`); }
  for (const p of [...known]) if (p.startsWith("/listing/") || p.startsWith("/places/")) known.add(`${p}/around`);
  return known;
}
/** Every welovecy.com link in an answer must be a real page: fix the common slip (an area as a place), or keep just the words. */
export function fixLinks(answer: string): string {
  return answer.replace(/\[([^\]]+)\]\((https:\/\/(?:www\.)?welovecy\.com)(\/[^)\s#?]*)?([#?][^)\s]*)?\)/g, (m, text: string, host: string, path = "/", rest = "") => {
    const p = path.replace(/\/$/, "") || "/";
    if (knownPaths().has(p)) return m;
    const area = /^\/places\/([a-z]+)$/.exec(p);
    if (area && getDest(area[1])) return `[${text}](${host}/destinations/${area[1]}${rest})`;
    return text;
  });
}

/** For the area list in the system prompt. */
/** The main towns in each area, from the register, so "Coral Bay" or "Peyia" lands in Paphos rather than Akamas. */
const AREA_TOWNS: Record<string, string> = Object.fromEntries(DESTINATIONS.map((d) => {
  const c = new Map<string, number>();
  const skip = new Set(["Not specified", ...(d.id === "troodos" ? ["Limassol", "Nicosia"] : [])]);
  for (const b of BUSINESSES) if (b.d === d.id && b.tw && !skip.has(b.tw)) c.set(b.tw, (c.get(b.tw) ?? 0) + 1);
  return [d.id, [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t]) => t).join(", ")];
}));
const EXTRA_TOWNS: Record<string, string> = { paphos: "Coral Bay, Kato Paphos", akamas: "Latchi, Baths of Aphrodite", ayianapa: "Makronissos, Nissi Beach", protaras: "Pernera, Kapparis, Fig Tree Bay", limassol: "Old Port, Limassol Marina", troodos: "Troodos Square, Prodromos" };
export const AREA_LINES = DESTINATIONS.map((d) => `${d.id} = ${d.name} (includes ${[EXTRA_TOWNS[d.id], AREA_TOWNS[d.id]].filter(Boolean).join(", ")})${districtsFor(d.id).length ? ` (pharmacy district: ${districtsFor(d.id).map((x) => x.id).join(" or ")})` : ""}`).join("\n");
export { byDistance };

/* ---------- Cards: the tappable results shown under an answer ---------- */

export interface CardBase { id: string; n: string; ll: LL; href: string; around: string; area?: string }
export interface Card {
  k: "pharmacy" | "place" | "weather" | "bus" | "partner";
  n: string; sub?: string; meta?: string; href?: string; map?: string; tel?: string; img?: string; stay?: CardBase;
  /** partner cards: their own booking link and id for counting taps */
  book?: string; pid?: string;
}
const own = (link?: unknown) => (typeof link === "string" ? link.replace(/^https:\/\/welovecy\.com/, "") : undefined);
const telOf = (p?: string | number) => (p ? `+357 ${String(p).replace(/^\+?357\s*/, "").trim()}` : undefined);

function placeCard(r: Record<string, unknown>, meta?: string): Card {
  const href = own(r.link);
  const c: Card = { k: "place", n: String(r.n), sub: String(r.about ?? r.kind ?? ""), meta, href };
  const lm = href && /^\/listing\/([^/]+)$/.exec(href);
  const pm = href && /^\/places\/([^/]+)$/.exec(href);
  if (lm) {
    const id = decodeURIComponent(lm[1]);
    const b = getBusiness(id);
    if (b) {
      c.map = bizDirections(b); c.tel = telOf(b.p); c.img = photoFor(`biz-${b.i}`)?.u;
      c.sub = [b.vt ? b.vt[0].toUpperCase() + b.vt.slice(1) : b.l, b.tw && b.tw !== "Not specified" ? b.tw : getDest(b.d)?.name].filter(Boolean).join(" · ");
      if (isStay(b) && b.ll) c.stay = { id: b.i, n: b.n, ll: b.ll, href: listingHref(b.i), around: `${listingHref(b.i)}/around`, area: b.d };
    }
    const p = getPoi(id);
    if (p) { c.map = p.sea ? undefined : poiDirections(p); c.tel = telOf(p.ph); c.img = photoFor(`beach-${p.i}`)?.u; c.sub = [p.k === "beach" ? "Beach" : c.sub, p.tw].filter(Boolean).join(" · "); }
  } else if (pm) {
    const pl = getPlace(pm[1]);
    if (pl) { c.img = photoFor(`place-${pl.slug}`)?.u; c.sub = pl.cat; if (pl.ll) c.map = `https://www.google.com/maps/dir/?api=1&destination=${pl.ll[0]},${pl.ll[1]}`; }
  }
  return c;
}

/** Turn a tool's result into cards. The route keeps only the ones the answer actually mentions. */
export function cardsFrom(name: string, out: unknown): Card[] {
  const o = (out ?? {}) as Record<string, unknown>;
  const list = (k: string) => (Array.isArray(o[k]) ? (o[k] as Record<string, unknown>[]) : []);
  switch (name) {
    case "pharmacies_on_duty":
      return list("pharmacies").map((x) => ({ k: "pharmacy", n: `Pharmacy in ${x.town}`, sub: String(x.address ?? ""), meta: String(o.hours ?? "").replace(/\s*\(.*\)$/, ""), tel: x.phone as string, map: x.map as string, href: own(o.link) }));
    case "find_places":
      return list("results").map((r) => placeCard(r));
    case "whats_near":
      return list("results").map((r) => placeCard(r, [r.distance, String(r.getting_there ?? "").replace(/ \(estimate\)/g, "")].filter(Boolean).join(" · ")));
    case "buses":
      return list("stops").map((s) => ({ k: "bus", n: String(s.n), sub: `Routes ${(s.routes as string[] | undefined)?.slice(0, 6).join(", ") ?? ""}`, meta: String(s.getting_there ?? "").replace(/ \(estimate\)/g, ""), href: own(s.link) }));
    case "guides":
    case "transfer_partner": {
      const p = o.partner as Record<string, string> | null;
      if (!p) return [];
      const id = own(p.page)?.replace("/partners/", "");
      return [{ k: "partner", n: p.name, sub: p.covers, meta: p.label, href: own(p.page), book: p.book, tel: p.phone, pid: id }];
    }
    case "weather": {
      const f = o.forecast as { t?: number; sym?: string } | undefined;
      const t = o.today as { sunset?: string } | undefined;
      if (!f || typeof f !== "object" || typeof f.t !== "number") return [];
      return [{ k: "weather", n: String(o.area), meta: `${Math.round(f.t)}°C · ${symbolInfo(f.sym ?? "").label}`, sub: t?.sunset ? `Sunset ${t.sunset}` : undefined, href: own(o.link) }];
    }
    default: return [];
  }
}

/** A line for the prompt about the page the visitor is looking at, so "here" and "this beach" work. */
export function pageContext(path?: string): string {
  if (!path) return "";
  const lm = /^\/listing\/([^/]+)/.exec(path);
  if (lm) {
    const id = decodeURIComponent(lm[1]);
    const n = getBusiness(id)?.n ?? getPoi(id)?.n;
    if (n) return `The visitor is looking at the page for ${n}. "Here" or "this place" means ${n}.`;
  }
  const pm = /^\/places\/([^/]+)/.exec(path);
  if (pm) { const pl = getPlace(pm[1]); if (pl) return `The visitor is looking at the page for ${pl.name}. "Here" means ${pl.name}.`; }
  const dm = /^\/(?:destinations|stay|eat-drink)\/([a-z]+)/.exec(path);
  if (dm && getDest(dm[1])) return `The visitor is browsing ${getDest(dm[1])!.name}.`;
  if (path.startsWith("/pharmacies-on-duty")) return "The visitor is on the pharmacies on duty page.";
  return "";
}
