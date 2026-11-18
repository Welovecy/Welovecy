import type { AroundKind } from "./types";

export interface KindMeta { n: string; one: string; c: string; l: string }

export const KINDS: Record<AroundKind, KindMeta> = {
  beach: { n: "Beaches", one: "Beach", c: "var(--k-beach)", l: "B" },
  sight: { n: "Sights", one: "Sight", c: "var(--k-sight)", l: "S" },
  family: { n: "Family days out", one: "Family day out", c: "var(--k-family)", l: "F" },
  eat: { n: "Eat & drink", one: "Place to eat", c: "var(--k-eat)", l: "E" },
  night: { n: "Bars & nightlife", one: "Bar", c: "var(--k-night)", l: "N" },
  stay: { n: "Places to stay", one: "Place to stay", c: "var(--k-stay)", l: "H" },
  pharmacy: { n: "Pharmacies", one: "Pharmacy", c: "var(--k-pharm)", l: "+" },
  health: { n: "Doctors & clinics", one: "Medical", c: "var(--k-health)", l: "M" },
  market: { n: "Supermarkets", one: "Supermarket", c: "var(--k-market)", l: "S" },
};

export const AROUND_TABS: [AroundKind, string][] = [
  ["beach", "Beaches"], ["sight", "Sights"], ["eat", "Eat & drink"], ["night", "Bars & nightlife"],
  ["family", "Family"], ["pharmacy", "Pharmacies"], ["health", "Doctors"], ["market", "Supermarkets"], ["stay", "Hotels"],
];

/** The four things a guest looks for first. Further than this, we say it isn't mapped yet. */
export const ESSENTIAL_KINDS: AroundKind[] = ["pharmacy", "health", "market", "beach"];
export const ESSENTIAL_CAP_KM = 15;
