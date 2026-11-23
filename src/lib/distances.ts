import table from "@data/distances.json";
import type { DestId } from "./types";

/** Road distances and drive times between airports, resorts and towns (OpenStreetMap road data). */
export const DIST_SOURCE = table.source;
export const DPLACES = table.P.map(([id, name]) => ({ id, name }));
const idx = new Map(DPLACES.map((p, i) => [p.id, i]));
export const AIRPORTS = [{ id: "lca", name: "Larnaca Airport", slug: "larnaca-airport" }, { id: "pfo", name: "Paphos Airport", slug: "paphos-airport" }];
/** Most-visited first: the order holidaymakers look for. */
export const POPULAR = ["ayianapa", "protaras", "paphos", "limassol", "larnaca", "coralbay", "pernera", "kapparis", "paralimni", "capegreco", "nicosia", "polis", "latchi", "pissouri", "lefkara", "troodos", "platres", "omodos", "kakopetria"];
export const placeName = (id: string) => DPLACES[idx.get(id)!]?.name ?? id;
export const slugOf = (id: string) => placeName(id).toLowerCase().replace(/\s*\(.*\)/, "").replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");
export const idOfSlug = (s: string) => DPLACES.find((p) => slugOf(p.id) === s)?.id;

/** Drive time to the nearest 5 minutes, with a small margin because routing engines assume empty roads. */
export const driveMin = (raw: number) => Math.max(5, Math.round((raw * 1.05) / 5) * 5);
export const fmtMin = (m: number) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60 ? `${m % 60} min` : ""}`.trim());
export function between(a: string, b: string) {
  const i = idx.get(a), j = idx.get(b);
  if (i == null || j == null) return null;
  return { km: Math.round(table.d[i][j]), min: driveMin(table.t[i][j]) };
}
/** Which airport is nearer by drive time. */
export function nearestAirport(id: string) {
  const l = between("lca", id)!, p = between("pfo", id)!;
  return l.min <= p.min ? { ...AIRPORTS[0], ...l } : { ...AIRPORTS[1], ...p };
}
/** Our area pages mapped to the table's places. */
export const DEST_PLACE: Partial<Record<DestId, string>> = { ayianapa: "ayianapa", protaras: "protaras", paphos: "paphos", limassol: "limassol", larnaca: "larnaca", nicosia: "nicosia", troodos: "troodos", akamas: "polis" };
