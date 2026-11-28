import Link from "next/link";
import { ISLAND_PATH, ISLAND_W, ISLAND_H, toMap } from "@/lib/island";
import type { LL } from "@/lib/types";

export interface IslandPin { ll: LL; label: string; href?: string; count?: number; on?: boolean }

/** The island with tappable pins or count bubbles. Pure SVG and CSS, so it costs nothing to load and never shifts. */
export function IslandMap({ pins, label }: { pins: IslandPin[]; label: string }) {
  return (
    <div className="imap" role="group" aria-label={label}>
      <svg viewBox={`0 0 ${ISLAND_W} ${ISLAND_H}`} aria-hidden="true">
        <path d={ISLAND_PATH} className="imap-land" />
      </svg>
      {pins.map((p) => {
        const [x, y] = toMap(p.ll);
        const style = { left: `${(x / ISLAND_W) * 100}%`, top: `${(y / ISLAND_H) * 100}%` };
        const cls = p.count != null ? `imap-bub${p.on ? " on" : ""}` : "imap-pin";
        const inner = p.count != null
          ? <><b>{p.count}</b><span className="sr"> places to stay in {p.label}</span></>
          : <><i aria-hidden="true" /><span>{p.label}</span></>;
        return p.href
          ? <Link key={p.label} href={p.href} className={cls} style={style} aria-label={p.count != null ? `${p.label}, ${p.count} places to stay` : p.label}>{inner}</Link>
          : <span key={p.label} className={cls} style={style}>{inner}</span>;
      })}
    </div>
  );
}
