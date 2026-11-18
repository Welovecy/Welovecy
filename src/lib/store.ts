"use client";
import { useSyncExternalStore } from "react";
import type { LL } from "./types";

/** Device-only storage. Works without it (private windows, blocked storage) by keeping state in memory. */
export interface SavedItem { key: string; n: string; href: string; sub?: string }
export interface Base { id: string; n: string; ll: LL; href: string; around: string; area?: string }

const KEYS = { saved: "wlc-saved-v2", base: "wlc-base-v2" } as const;
type Key = keyof typeof KEYS;
const memory: Record<Key, string | null> = { saved: null, base: null };
const listeners = new Set<() => void>();
const cache = new Map<Key, { raw: string | null; value: unknown }>();

function readRaw(k: Key): string | null {
  try { return window.localStorage.getItem(KEYS[k]); } catch { return memory[k]; }
}
function writeRaw(k: Key, v: string | null) {
  memory[k] = v;
  try {
    if (v == null) window.localStorage.removeItem(KEYS[k]);
    else window.localStorage.setItem(KEYS[k], v);
  } catch { /* storage unavailable: memory copy is used */ }
  cache.delete(k);
  listeners.forEach((l) => l());
}
function parse<T>(k: Key, fallback: T, valid: (v: unknown) => v is T): T {
  const raw = readRaw(k);
  const hit = cache.get(k);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw) { try { const v = JSON.parse(raw); if (valid(v)) value = v; } catch { /* ignore bad data */ } }
  cache.set(k, { raw, value });
  return value;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => { if (!e.key || Object.values(KEYS).includes(e.key as never)) { cache.clear(); cb(); } };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(cb); window.removeEventListener("storage", onStorage); };
}

const EMPTY: SavedItem[] = [];
const isSavedList = (v: unknown): v is SavedItem[] =>
  Array.isArray(v) && v.every((x) => x && typeof x.key === "string" && typeof x.n === "string" && typeof x.href === "string");
const isBase = (v: unknown): v is Base =>
  !!v && typeof (v as Base).id === "string" && Array.isArray((v as Base).ll) && (v as Base).ll.length === 2 &&
  (v as Base).ll.every((n) => typeof n === "number" && Number.isFinite(n));

export const getSaved = () => parse("saved", EMPTY, isSavedList);
export const getBase = () => parse<Base | null>("base", null, (v): v is Base | null => isBase(v));

export function useSaved(): SavedItem[] {
  return useSyncExternalStore(subscribe, getSaved, () => EMPTY);
}
export function useBase(): Base | null {
  return useSyncExternalStore(subscribe, getBase, () => null);
}

export function toggleSaved(item: SavedItem): boolean {
  const list = getSaved();
  const on = list.some((x) => x.key === item.key);
  const next = on ? list.filter((x) => x.key !== item.key) : [item, ...list].slice(0, 300);
  writeRaw("saved", JSON.stringify(next));
  return !on;
}
export function clearSaved() { writeRaw("saved", null); }
export function setBase(b: Base | null) { writeRaw("base", b ? JSON.stringify(b) : null); }
