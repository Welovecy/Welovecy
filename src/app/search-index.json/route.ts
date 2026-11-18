import { BUSINESSES, DESTINATIONS, PLACES, POIS, bizSub, getDest, isStay, listingHref, placeForPoi, placeHref, poiSub } from "@/lib/data";
import { norm } from "@/lib/text";
import type { IndexEntry } from "@/components/WhereSearch";

export const dynamic = "force-static";

export function GET() {
  const out: IndexEntry[] = [];
  for (const d of DESTINATIONS) out.push({ t: "a", n: d.name, s: d.live ? "Explore the area" : "Area guide in progress", h: `/destinations/${d.id}`, q: norm(`${d.name} ${d.id}`), d: d.id });
  for (const p of PLACES) out.push({ t: "p", n: p.name, s: `${p.cat} · ${getDest(p.dest)?.name ?? ""}`, h: placeHref(p.slug), q: norm(`${p.name} ${p.cat}`), d: p.dest });
  for (const r of POIS) {
    if (!["beach", "sight", "family"].includes(r.k) || placeForPoi(r.i)) continue;
    out.push({ t: "p", n: r.n, s: [poiSub(r), r.tw].filter(Boolean).join(" · "), h: listingHref(r.i), q: norm(`${r.n} ${r.alt || ""} ${r.tw || ""}`), d: r.d });
  }
  for (const b of BUSINESSES) {
    if (!isStay(b)) continue;
    out.push({
      t: "h", n: b.n, s: bizSub(b) + (b.ll ? " · see what's around" : ""),
      h: b.ll ? `${listingHref(b.i)}/around` : listingHref(b.i), q: norm(`${b.n} ${b.tw}`), d: b.d, ...(b.ll ? { m: 1 as const } : {}),
    });
  }
  return Response.json(out, { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } });
}
