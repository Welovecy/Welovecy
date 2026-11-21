import "server-only";
import type { Business, Fact, Poi, Source } from "./types";
import { getDest, isStay, townOf } from "./data";
import { stars, formatDate } from "./text";
import { beachFacts } from "@/components/BeachFacts";

const STATUS_NOTE = /process/i;

export function bizFacts(b: Business): Fact[] {
  const f: Fact[] = [["Type", b.l, false]];
  const st = stars(b.c);
  if (st) f.push(["Class", st, false]);
  f.push(["Area", `${townOf(b.tw, b.d)}${b.tw !== "Not specified" && getDest(b.d) ? `, ${getDest(b.d)!.name}` : ""}`, false]);
  f.push(b.a ? ["Address", b.a, false] : ["Address", "Not listed in the register.", true]);
  if (b.p) f.push(["Phone", b.p, false]);
  if (b.e) f.push(["Email", b.e, false]);
  if (isStay(b) && b.r) f.push([b.g === "apart" ? "Units" : "Rooms", `${b.r}${b.b ? ` (${b.b} beds)` : ""}`, false]);
  if (b.s && STATUS_NOTE.test(b.s)) f.push(["Licence", "Licensing or classification in process, per the register.", false]);
  f.push(["Opening hours", "Not yet verified.", true]);
  f.push(["Map position", b.ll ? (b.ls === "ov" ? "Matched to Overture Maps." : "Matched to OpenStreetMap.") : "No map pin yet. Directions search the address.", !b.ll]);
  return f;
}

export function bizSources(b: Business): { list: Source[]; reviewed: string } {
  const list: Source[] = [{ t: isStay(b) ? "Visit Cyprus (Deputy Ministry of Tourism): licensed accommodation list" : "Visit Cyprus (Deputy Ministry of Tourism): licensed restaurants and bars list", u: b.su }];
  if (b.ll && b.ls === "ov") list.push({ t: "Location: Overture Maps Foundation", u: "https://overturemaps.org/" });
  else if (b.ll) list.push({ t: "Location: OpenStreetMap contributors", u: `https://www.openstreetmap.org/?mlat=${b.ll[0]}&mlon=${b.ll[1]}#map=18/${b.ll[0]}/${b.ll[1]}` });
  return { list, reviewed: `register dated ${formatDate(b.sd)}` };
}

export function poiFacts(r: Poi): Fact[] {
  if (r.k === "beach") return beachFacts(r);
  const f: Fact[] = [];
  if (r.k === "pharmacy") f.push(["Pharmacist", r.n, false]);
  if (r.k === "health" && r.ft) f.push(["Type", r.ft, false]);
  if (r.k === "market" && r.ch) f.push(["Chain", r.ch, false]);
  if (r.a) f.push(["Address", r.a + (r.tw ? `, ${r.tw}` : ""), false]);
  else if (r.tw) f.push(["Area", r.tw, false]);
  if (r.ph) f.push(["Phone", String(r.ph), false]);
  f.push(r.hrs ? ["Opening hours", r.hrs, false] : ["Opening hours", "Not yet verified.", true]);
  if (r.reg) f.push(["Register number", String(r.reg), false]);
  f.push([
    "Map position",
    r.ls === "ov" ? "Matched to Overture Maps." : r.pr === "approx" ? "Approximate, matched to the street. Use Directions for the exact address." : r.ll ? "From the source map data." : "No map pin yet. Directions search the address.",
    r.pr === "approx" || !r.ll,
  ]);
  return f;
}

export function poiSources(r: Poi): { list: Source[]; reviewed: string } {
  if (r.src === "osm" && r.ll) {
    return {
      list: [{ t: "OpenStreetMap contributors", u: `https://www.openstreetmap.org/?mlat=${r.ll[0]}&mlon=${r.ll[1]}#map=18/${r.ll[0]}/${r.ll[1]}` }],
      reviewed: "location from OpenStreetMap, details not yet checked",
    };
  }
  const list: Source[] = [];
  if (r.info) list.push({ t: "Official beach page", u: r.info });
  if (r.bw) list.push({ t: "Bathing water profile (Department of Environment)", u: r.bw });
  if (r.ls === "ov") list.push({ t: "Location: Overture Maps Foundation", u: "https://overturemaps.org/" });
  if (r.su && r.su !== r.info) {
    list.push({ t: r.k === "pharmacy" ? "Pharmaceutical Services: register of private pharmacies" : r.k === "beach" ? "Source listing" : "Official register or store finder", u: r.su });
  }
  return { list, reviewed: `retrieved ${formatDate(r.sd)}${r.ed ? `, ${r.ed}` : ""}` };
}
