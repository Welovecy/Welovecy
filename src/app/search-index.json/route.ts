import { BUSINESSES, DESTINATIONS, PLACES, POIS, PROFILES, bizSub, getDest, isStay, listingHref, placeForPoi, placeHref, poiSub } from "@/lib/data";
import { norm } from "@/lib/text";
import aliasJson from "@data/aliases.json";

const ALIAS = (aliasJson as { aliases: Record<string, string[]> }).aliases;
const VT: Record<string, string> = { restaurant: "Restaurant", taverna: "Taverna", cafe: "Café", snack: "Snack bar", bar: "Bar", pub: "Pub", club: "Club", beachbar: "Beach bar" };
import type { IndexEntry } from "@/components/WhereSearch";

export const dynamic = "force-static";

export function GET() {
  const out: IndexEntry[] = [];
  for (const d of DESTINATIONS) out.push({ t: "a", n: d.name, s: d.live ? "Explore the area" : "Area guide in progress", h: `/destinations/${d.id}`, q: norm(`${d.name} ${d.id}`), d: d.id });
  for (const [dest, pr] of Object.entries(PROFILES)) {
    for (const l of pr.localities) out.push({ t: "a", n: l.title, s: `Area of ${getDest(dest)?.name ?? ""}`, h: `/destinations/${dest}/${l.slug}`, q: norm(`${l.title} ${l.slug.replace(/-/g, " ")}`), d: dest });
  }
  for (const p of PLACES) out.push({
    t: "p", n: p.name, s: `${p.unesco ? "UNESCO World Heritage" : p.cat} · ${getDest(p.dest)?.name ?? ""}`, h: placeHref(p.slug),
    q: norm(`${p.name} ${p.cat} ${(p.alt ?? []).join(" ")} ${p.loc ?? ""}`), d: p.dest,
  });
  for (const r of POIS) {
    if (!["beach", "sight", "family", "activity", "nature", "info"].includes(r.k) || placeForPoi(r.i)) continue;
    out.push({ t: "p", n: r.n, s: [poiSub(r), r.tw].filter(Boolean).join(" · "), h: listingHref(r.i), q: norm(`${r.n} ${r.alt || ""} ${r.tw || ""} ${r.cat || ""}${r.k === "nature" ? " walk hike hiking" : r.k === "info" ? " tourist information office" : ""} ${(ALIAS[r.i] ?? []).join(" ")}`), d: r.d });
  }
  for (const b of BUSINESSES) {
    if (!isStay(b)) continue;
    out.push({
      t: "h", n: b.n, s: bizSub(b) + (b.ll ? " · see what's around" : ""),
      h: b.ll ? `${listingHref(b.i)}/around` : listingHref(b.i), q: norm(`${b.n} ${b.tw} ${(ALIAS[b.i] ?? []).join(" ")}`), d: b.d, ...(b.ll ? { m: 1 as const } : {}),
    });
  }
  // Restaurants, cafés, bars and clubs: every licensed venue, so anything on the site can be found by name.
  for (const b of BUSINESSES) {
    if (isStay(b) || b.vt === "cabaret") continue;
    const town = b.tw && b.tw !== "Not specified" ? b.tw : getDest(b.d)?.name ?? "";
    out.push({
      t: "v", n: b.n, s: [b.vt ? VT[b.vt] : b.l, town].filter(Boolean).join(" · "), h: listingHref(b.i),
      q: norm(`${b.n} ${[b.vt ? VT[b.vt] : b.l, town].filter(Boolean).join(" · ")}${ALIAS[b.i] ? " " + ALIAS[b.i].join(" ") : ""}`), d: b.d,
    });
  }
  // Drop q when the browser can rebuild it from the name and subtitle: keeps the file small on phones.
  for (const e of out) if (e.q === norm(`${e.n} ${e.s}`)) delete (e as Partial<IndexEntry>).q;
  return Response.json(out, { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } });
}
