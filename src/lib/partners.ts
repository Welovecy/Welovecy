import partnersJson from "../../data/partners.json";
import type { DestId, LL } from "./types";
import { norm } from "./text";

/**
 * Advertising partners. The data says who covers what; this file decides, in code, whether a partner may be
 * mentioned for a request. Aphrodite never judges that herself: if partnerFor() returns nothing, she can't name one.
 */
export type PartnerService = "airport_transfer" | "local_taxi" | "car_hire";
export interface Partner {
  id: string; status: "active" | "paused"; name: string; legal?: string; kind: string; services: PartnerService[];
  coverage: { label: string; areas?: DestId[]; places: string[]; aliases: string[]; box?: [number, number, number, number]; towns?: string[]; maybe?: string[] };
  intro: string; address?: string; address2?: string; web: string; book: string; phone: string | null; phone2?: string; email: string | null;
  airports: string[] | null; hours?: string; checked?: string; photo?: string; logo: string | null; guides: string[]; excludes: string; sources: { t: string; u: string }[]; pending: string[];
}

export const PARTNERS = (partnersJson as unknown as { partners: Partner[] }).partners;
export const ACTIVE = PARTNERS.filter((p) => p.status === "active");
export const PARTNER_LABEL = "Advertising partner";
export const partnerHref = (id: string) => `/partners/${id}`;
export const getPartner = (id: string) => PARTNERS.find((p) => p.id === id);
export const partnerForGuide = (slug: string) => ACTIVE.find((p) => p.guides.includes(slug));

/** Where the visitor is staying, as much as we know: a typed place name, a town, an area, a pin. */
export interface Stay { text?: string; town?: string; area?: DestId; ll?: LL }

const inBox = (ll: LL, b: [number, number, number, number]) => ll[0] >= b[0] && ll[1] >= b[1] && ll[0] <= b[2] && ll[1] <= b[3];
const hasWord = (hay: string, phrase: string) => ` ${hay} `.includes(` ${phrase} `);

/** True when this stay is inside the partner's agreed coverage. Unknown means no. */
export function covers(p: Partner, s: Stay): boolean {
  const c = p.coverage;
  if (s.area && c.areas?.includes(s.area)) return true;
  const town = norm(s.town ?? "");
  if (town && c.towns?.some((t) => town === t)) return true;
  if (town && c.aliases.some((a) => town === a)) return true;
  if (s.ll && c.box && inBox(s.ll, c.box) && (!town || town === "agios georgios" || town === "not specified")) return true;
  const text = norm(s.text ?? "");
  if (text && c.aliases.some((a) => hasWord(text, a))) return true;
  return false;
}

/** The one partner (or none) that may be recommended for this service and stay. */
export function partnerFor(service: PartnerService, s: Stay): Partner | undefined {
  return PARTNERS.find((p) => p.status === "active" && p.services.includes(service) && covers(p, s));
}
