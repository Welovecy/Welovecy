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
}

export type PoiKind = "beach" | "sight" | "family" | "pharmacy" | "health" | "market";
export interface Poi {
  i: string; k: PoiKind; n: string; d: DestId; tw?: string; a?: string; ph?: string | number;
  ll?: LL; pr?: "exact" | "source" | "osm" | "approx"; src?: "osm";
  su?: string; sd?: string; reg?: string | number; ed?: string; ch?: string; ft?: string; hrs?: string;
  bf?: boolean; sf?: string; fac?: string[]; acc?: string; alt?: string; info?: string; bw?: string; bwid?: string;
}

/** Everything that can sit on the "what's around" map. */
export type AroundKind = PoiKind | "eat" | "night" | "stay";
export interface Spot {
  key: string;
  n: string;
  k: AroundKind;
  ll: LL;
  href: string;
  sub: string;
  approx?: boolean;
  dir?: string;
}

export interface Photo { u: string; a: string; l: string; p?: string; t: string }
