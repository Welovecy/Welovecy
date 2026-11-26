import type { AroundKind } from "./types";

export interface KindMeta { n: string; one: string; c: string; l: string }

export const KINDS: Record<AroundKind, KindMeta> = {
  beach: { n: "Beaches", one: "Beach", c: "var(--k-beach)", l: "B" },
  sight: { n: "Sights", one: "Sight", c: "var(--k-sight)", l: "S" },
  family: { n: "Family days out", one: "Family day out", c: "var(--k-family)", l: "F" },
  activity: { n: "Diving & activities", one: "Activity", c: "var(--k-act)", l: "A" },
  nature: { n: "Walks & nature", one: "Walk or nature spot", c: "var(--k-nature)", l: "W" },
  info: { n: "Tourist info", one: "Tourist information office", c: "var(--k-info)", l: "i" },
  eat: { n: "Eat & drink", one: "Place to eat", c: "var(--k-eat)", l: "E" },
  night: { n: "Bars & nightlife", one: "Bar", c: "var(--k-night)", l: "N" },
  stay: { n: "Places to stay", one: "Place to stay", c: "var(--k-stay)", l: "H" },
  pharmacy: { n: "Pharmacies", one: "Pharmacy", c: "var(--k-pharm)", l: "+" },
  health: { n: "Doctors & clinics", one: "Medical", c: "var(--k-health)", l: "M" },
  market: { n: "Supermarkets", one: "Supermarket", c: "var(--k-market)", l: "S" },
  bus: { n: "Bus stops", one: "Bus stop", c: "var(--k-bus)", l: "BUS" },
};

export const AROUND_TABS: [AroundKind, string][] = [
  ["beach", "Beaches"], ["sight", "Sights"], ["eat", "Eat & drink"], ["night", "Bars & nightlife"],
  ["family", "Family"], ["activity", "Diving & activities"], ["nature", "Walks & nature"], ["market", "Supermarkets"], ["pharmacy", "Pharmacies"], ["bus", "Buses"], ["health", "Doctors"], ["info", "Tourist info"], ["stay", "Hotels"],
];

/** What a guest looks for first, in this order. Further than the cap, we say it isn't mapped yet. */
export const ESSENTIAL_KINDS: AroundKind[] = ["beach", "eat", "market", "pharmacy", "bus"];
export const ESSENTIAL_LABEL: Partial<Record<AroundKind, string>> = {
  beach: "Nearest beach", eat: "Nearest restaurant", market: "Nearest supermarket", pharmacy: "Nearest pharmacy", bus: "Nearest bus stop",
};
export const ESSENTIAL_CAP_KM = 15;
