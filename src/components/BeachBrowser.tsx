"use client";
import { useMemo, useState } from "react";
import { ListRow } from "./ListRow";

export interface BeachItem { href: string; n: string; sub: string; dir?: string; area: string; bf: boolean; lg: boolean; sand: boolean; play: boolean; color: string }

const FILTERS: [string, string][] = [["all", "All beaches"], ["bf", "Blue Flag"], ["lg", "Lifeguards"], ["sand", "Sandy"], ["play", "Playground"]];

export function BeachBrowser({ items, areas }: { items: BeachItem[]; areas: [string, string][] }) {
  const [area, setArea] = useState("");
  const [f, setF] = useState("all");
  const shown = useMemo(() => items.filter((b) =>
    (!area || b.area === area) && (f === "all" || (f === "bf" && b.bf) || (f === "lg" && b.lg) || (f === "sand" && b.sand) || (f === "play" && b.play))), [items, area, f]);
  return (
    <>
      <div className="chips" role="group" aria-label="Area" style={{ marginBottom: 10 }}>
        <button className="chip" type="button" aria-pressed={!area} onClick={() => setArea("")}>All areas</button>
        {areas.map(([id, name]) => <button key={id} className="chip" type="button" aria-pressed={area === id} onClick={() => setArea(id)}>{name}</button>)}
      </div>
      <div className="chips" role="group" aria-label="Beach type" style={{ marginBottom: 20 }}>
        {FILTERS.map(([id, name]) => <button key={id} className="chip" type="button" aria-pressed={f === id} onClick={() => setF(id)}>{name}</button>)}
      </div>
      <p className="dir-count" aria-live="polite" style={{ marginBottom: 10 }}>{shown.length} {shown.length === 1 ? "beach" : "beaches"}</p>
      {shown.length ? <ul className="rows">{shown.map((b) => <ListRow key={b.href} href={b.href} n={b.n} sub={b.sub} mono="B" color={b.color} dir={b.dir} save />)}</ul>
        : <div className="empty"><p>No beaches match. Try another filter.</p></div>}
    </>
  );
}
