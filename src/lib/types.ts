export type LL = [number, number];
/** [label, value, unconfirmed] */
export type Fact = [string, string, boolean];

export type DestId =
  | "ayianapa" | "protaras" | "paphos" | "akamas" | "limassol" | "larnaca" | "nicosia" | "troodos";

export interface Destination {
  id: DestId;
  name: string;
  line: string;
  tint: string;
  live: boolean;
  hero?: string;
  glance?: [string, string][];
  start?: string[];
  plan?: Fact[];
  next?: DestId[];
}

export interface Source { t: string; u: string }

export interface Place {
  slug: string;
  name: string;
  dest: DestId;
  cat: string;
  interests: string[];
  tint: string;
  intro: string;
  why: string;
  features: string[];
  legend?: string;
  practical: Fact[];
  sources: Source[];
  nearby?: string[];
  ll?: LL;
  /** from the visitor guide */
  loc?: string;
  how?: string;
  before?: string;
  unesco?: UnescoId;
  alt?: string[];
  /** owning locality page, "region/locality" */
  locality?: string;
}

export type UnescoId = "paphos" | "choirokoitia" | "troodos";

export interface WineRoute { n: string; loc: string; ll: LL | null; dest: DestId; how: string; before: string; wineries: string[]; places?: string[] }

export interface Locality { slug: string; title: string; centre: LL; radius: number; bio: string; lead: string; refs: string[]; nearby?: boolean }
export interface Profile {
  intro: string; start: [string, string][]; day: string; travel: string; food: string;
  faqs: [string, string][]; sources: Source[]; localities: Locality[];
}

export interface Experience {
  slug: string; name: string; dest: DestId; place: string; tint: string; sample?: boolean;
  intro: string; detail: string; practical: Fact[]; business: string;
}

export interface Maker {
  slug: string; name: string; cat: string; locality: string; dest: DestId; tint: string; sample?: boolean;
  line: string; services: string[]; practical: Fact[];
}

export interface Interest { id: string; name: string; line: string }

/** Licensed businesses from the official tourism registers. Short keys keep the data small. */
export type BizGroup = "eat" | "cafe" | "night" | "hotel" | "apart";
export interface Business {
  i: string; n: string; g: BizGroup; l: string; tw: string; d: DestId;
  a?: string; p?: string; e?: string; w?: string; c?: string;
  r?: number; b?: number; s?: string; sd: string; su: string; x?: number; ll?: LL;
  /** where the pin came from: "ov" = Overture Maps, otherwise OpenStreetMap */
  ls?: "ov";
}

export type PoiKind = "beach" | "sight" | "family" | "pharmacy" | "health" | "market";
export interface Poi {
  i: string; k: PoiKind; n: string; d: DestId; tw?: string; a?: string; ph?: string | number;
  ll?: LL; pr?: "exact" | "source" | "osm" | "approx"; src?: "osm";
  su?: string; sd?: string; reg?: string | number; ed?: string; ch?: string; ft?: string; hrs?: string;
  bf?: boolean; sf?: string; fac?: string[]; acc?: string; alt?: string; info?: string; bw?: string; bwid?: string;
  ls?: "ov";
}

/** Everything that can sit on the "what's around" map. */
export type AroundKind = PoiKind | "eat" | "night" | "stay" | "bus";
export interface Spot {
  key: string;
  n: string;
  k: AroundKind;
  ll: LL;
  href: string;
  sub: string;
  approx?: boolean;
  dir?: string;
  /** bus stops: route numbers that call here */
  rt?: string[];
}

export interface BusRoute {
  r: string; a: string; op: string; l: string; gl: string; air: string | null; web: string | null; to: string[]; from: string[];
}
export interface BusStop { i: string; n: string; g: string; ll: LL; rk: string[] }
export interface AirportService {
  air: string; op: string; type: string; route: string; num: string | null; change: string; board: string; web: string | null; book: string | null; ph: string;
}
export interface BusData {
  routes: Record<string, BusRoute>; stops: BusStop[]; ops: Record<string, { web: string | null; ph: string }>;
  airport: AirportService[]; source: { t: string; u: string; date: string };
}

export interface Photo { u: string; a: string; l: string; p?: string; t: string }
