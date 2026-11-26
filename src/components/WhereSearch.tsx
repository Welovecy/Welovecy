"use client";
import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { norm } from "@/lib/text";

/** One entry of /search-index.json. t: a = area, p = place or beach, h = hotel or apartment, v = restaurant, café, bar or club. */
export interface IndexEntry { t: "a" | "p" | "h" | "v"; n: string; s: string; h: string; q: string; d?: string; m?: 1 }

let indexPromise: Promise<IndexEntry[]> | null = null;
function loadIndex(): Promise<IndexEntry[]> {
  if (!indexPromise) {
    indexPromise = fetch("/search-index.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((list: IndexEntry[]) => { for (const e of list) e.q ||= norm(`${e.n} ${e.s}`); return list; })
      .catch((e) => { indexPromise = null; throw e; });
  }
  return indexPromise;
}

interface Props {
  /** "all": areas, places and hotels. "stay": hotels and apartments only. */
  scope?: "all" | "stay";
  dest?: string;
  placeholder?: string;
  label?: string;
  hint?: string;
  autoFocus?: boolean;
}

const GROUPS: [IndexEntry["t"], string, number][] = [["a", "Areas", 3], ["p", "Places and beaches", 5], ["v", "Eat, drink and nightlife", 6], ["h", "Hotels and apartments", 8]];
const MONO: Record<IndexEntry["t"], string> = { a: "A", p: "P", h: "H", v: "E" };

export function WhereSearch({ scope = "all", dest, placeholder = "Where are you staying or going?", label, hint, autoFocus }: Props) {
  const id = useId();
  const [q, setQ] = useState("");
  const [index, setIndex] = useState<IndexEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const started = useRef(false);

  const start = useCallback(() => {
    if (started.current) return;
    started.current = true;
    loadIndex().then(setIndex).catch(() => { started.current = false; setFailed(true); });
  }, []);
  useEffect(() => { if (autoFocus) start(); }, [autoFocus, start]);

  const nq = norm(q);
  const results = useMemo(() => {
    if (!index || nq.length < 2) return null;
    const words = nq.split(" ");
    const hits = index.filter((e) =>
      (scope === "all" || e.t === "h") && (!dest || e.d === dest) && words.every((w) => e.q.includes(w)));
    // names that start with the query first, then mapped hotels, then A to Z
    const score = (e: IndexEntry) => (e.q.startsWith(nq) ? 0 : 1) + (e.t === "h" && !e.m ? 0.5 : 0);
    hits.sort((a, b) => score(a) - score(b) || a.n.localeCompare(b.n));
    return hits;
  }, [index, nq, scope, dest]);

  const fieldLabel = label || placeholder;
  return (
    <div className="picker">
      <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
        <label className="sr" htmlFor={id}>{fieldLabel}</label>
        <input
          id={id} type="search" autoComplete="off" placeholder={placeholder} value={q} autoFocus={autoFocus}
          onFocus={start} onChange={(e) => { start(); setQ(e.target.value); }}
        />
      </form>
      <div aria-live="polite">
        {failed ? <p className="hint">Search isn&apos;t available right now. Check your connection and try again.</p>
          : !results ? <p className="hint">{hint || (scope === "stay" ? "Start typing, for example Nissi Beach or Sunrise." : "Type a hotel, a town or a place. For example Protaras, Nissi Beach or Paphos.")}</p>
          : !results.length ? <p className="hint">Nothing found. Try a shorter part of the name.</p>
          : GROUPS.map(([t, title, max]) => {
              const g = results.filter((r) => r.t === t);
              if (!g.length) return null;
              return (
                <div key={t}>
                  {scope === "all" ? <p className="tag group-tag">{title}</p> : null}
                  <ul className="rows">
                    {g.slice(0, scope === "stay" ? 8 : max).map((r) => (
                      <li key={r.h}>
                        <Link className="row" href={r.h}>
                          <span className="mono" aria-hidden="true">{MONO[r.t]}</span>
                          <span className="rowtxt"><strong>{r.n}</strong><span>{r.s}</span></span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
      </div>
    </div>
  );
}
