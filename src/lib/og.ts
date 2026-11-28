import { getBusiness, getDest, getPlace, getPoi, photoFor, bizSub, poiSub } from "./data";
import { getPartner } from "./partners";
import { getGuide } from "./guides";
import type { LL } from "./types";

/** What a page's share card shows. Built from our own data by page path, never from free text in the URL. */
export interface OgCard { title: string; eyebrow: string; img?: string; tint: string; ll?: LL; chips: string[] }

const BRAND: OgCard = { title: "Find your Cyprus.", eyebrow: "A guide to the Republic of Cyprus", img: "/img/aphrodite-rock.jpg", tint: "#2E6E8E", chips: ["Beaches", "Must-see", "What's around your hotel"] };

/** Fixed cards for the main sections. */
const SECTIONS: Record<string, Omit<OgCard, "tint"> & { tint?: string }> = {
  "/beaches": { title: "Find your beach.", eyebrow: "132 beaches across Cyprus", img: photoFor("place-nissi")?.u, chips: ["Blue Flag", "Sandy", "Near me"] },
  "/must-see": { title: "Must-see Cyprus", eyebrow: "Sights worth the trip", img: photoFor("place-kourion")?.u, chips: [] },
  "/around": { title: "What's around your hotel", eyebrow: "Beaches, food, pharmacies and buses, by walk or drive", chips: [] },
  "/petrol": { title: "Petrol near you", eyebrow: "The nearest stations by drive time", chips: [] },
  "/pharmacies-on-duty": { title: "Pharmacies on duty tonight", eyebrow: "From the official rota", chips: [] },
  "/know-before-you-go": { title: "Know before you go", eyebrow: "Checked facts for visiting Cyprus", chips: [] },
  "/living-in-cyprus": { title: "Living in Cyprus", eyebrow: "Residence, health, driving, bills and schools", chips: [] },
  "/cyprus-history": { title: "11,000 years of Cyprus", eyebrow: "A short history", img: photoFor("place-choirokoitia")?.u, chips: [] },
  "/events": { title: "What's on in Cyprus", eyebrow: "Events and festivals", chips: [] },
};

const big = (u?: string) => (u && /\/\d+px-/.test(u) ? u.replace(/\/\d+px-/, "/1280px-") : u);

export function ogFor(path: string): OgCard {
  const p = path.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  const seg = p.split("/").filter(Boolean);
  if (p === "/") return BRAND;
  if (SECTIONS[p]) return { tint: "#2E6E8E", ...SECTIONS[p], img: big(SECTIONS[p].img) };
  const [a, b] = seg;
  if (a === "places" && b) {
    const x = getPlace(b);
    if (x) {
      const d = getDest(x.dest);
      return { title: x.name, eyebrow: `${x.cat}${d ? ` · ${d.name}` : ""}`, img: big(photoFor(`place-${x.slug}`)?.u), tint: x.tint ?? "#2E6E8E", ll: x.ll, chips: [] };
    }
  }
  if (a === "listing" && b) {
    const r = getPoi(b);
    if (r) {
      const beach = r.k === "beach";
      const chips = beach ? [r.bf ? "Blue Flag 2026" : "", r.sf ?? "", r.fac?.includes("Lifeguards") ? "Lifeguards" : ""].filter(Boolean) : [r.len ?? "", r.grade ? `Grade ${r.grade} of 3` : ""].filter(Boolean);
      return { title: r.n, eyebrow: `${beach ? "Beach" : poiSub(r)}${r.tw ? ` · ${r.tw}` : ""}`, img: big(photoFor(beach ? `beach-${r.i}` : `poi-${r.i}`)?.u), tint: beach ? "#2E6E8E" : "#6B5A3E", ll: r.ll, chips };
    }
    const biz = getBusiness(b);
    if (biz) return { title: biz.n, eyebrow: bizSub(biz), img: big(photoFor(`biz-${biz.i}`)?.u), tint: biz.g === "hotel" || biz.g === "apart" ? "#3F5E7A" : "#8A4B3C", ll: biz.ll, chips: [] };
  }
  if (a === "destinations" && b) {
    const d = getDest(b);
    if (d) return { title: d.name, eyebrow: "Destination", img: big(photoFor(`dest-${d.id}`)?.u), tint: d.tint, chips: [] };
  }
  if (a === "partners" && b) {
    const x = getPartner(b);
    if (x) return { title: x.name, eyebrow: x.kind, img: x.id === "cy-cruises" ? "/img/partners/cycruises/black-pearl-og.jpg" : undefined, tint: "#2E6E8E", chips: ["Advertising partner"] };
  }
  if (a === "guides" && b) {
    const g = getGuide(b);
    if (g) return { title: g.title, eyebrow: "Guide", img: big(g.image ? photoFor(g.image)?.u : undefined), tint: "#2E6E8E", chips: [] };
  }
  return BRAND;
}

/** The share image address for a page. `v` changes when the card design changes, so platforms fetch it again. */
export const ogImage = (path: string) => `/api/og?p=${encodeURIComponent(path)}&v=1`;
export const ogMeta = (path: string, alt?: string) => ({ type: "website" as const, siteName: "We Love Cyprus", locale: "en_GB", images: [{ url: ogImage(path), width: 1200, height: 630, alt: alt ?? ogFor(path).title }] });
