import Link from "next/link";
import { fmtD } from "@/lib/geo";
import { KINDS } from "@/lib/kinds";
import type { AroundKind, LL } from "@/lib/types";
import type { Near } from "@/lib/around";

/** A distance map: the starting point in the middle, everything nearby by true bearing and distance. */
export function Radar({ center, focus, others, kind, label }: { center: LL; focus: Near[]; others: Near[]; kind: AroundKind; label: string }) {
  const R = 170, C = 200;
  let max = focus.length ? focus[Math.min(focus.length - 1, 11)].d * 1.15 : 1;
  max = Math.min(Math.max(max, 0.6), 8);
  const rings = [0.25, 0.5, 1, 2, 3, 5, 8].filter((r) => r < max * 0.98).slice(-3);
  const c0 = Math.cos((center[0] * Math.PI) / 180);
  const pos = (ll: LL): [number, number] => {
    const dx = (ll[1] - center[1]) * 111.32 * c0, dy = (ll[0] - center[0]) * 110.57;
    return [C + (dx / max) * R, C - (dy / max) * R];
  };
  const shownFocus = focus.filter((n) => n.d <= max);
  const shownOthers = others.filter((n) => n.d <= max);
  return (
    <svg className="radar" viewBox="0 0 400 400" role="img" aria-label={`Distance map of ${KINDS[kind].n.toLowerCase()} around ${label}`}>
      {rings.map((r) => {
        const rr = (r / max) * R;
        return (
          <g key={r}>
            <circle className="ring" cx={C} cy={C} r={rr.toFixed(1)} />
            <text x={C + 4} y={(C - rr - 4).toFixed(1)}>{fmtD(r)}</text>
          </g>
        );
      })}
      {shownOthers.map((n) => {
        const [x, y] = pos(n.s.ll);
        return <circle key={n.s.key} cx={x.toFixed(1)} cy={y.toFixed(1)} r="2.5" fill="var(--line)" />;
      })}
      {shownFocus.map((n, i) => {
        const [x, y] = pos(n.s.ll);
        const name = n.s.n.length > 18 ? n.s.n.slice(0, 17) + "…" : n.s.n;
        return (
          <Link key={n.s.key} href={n.s.href}>
            <circle className="dot" style={{ animationDelay: `${(i * 0.04).toFixed(2)}s` }} cx={x.toFixed(1)} cy={y.toFixed(1)} r="6" fill={KINDS[n.s.k].c} stroke="var(--card)" strokeWidth="2">
              <title>{`${n.s.n}, ${fmtD(n.d)}`}</title>
            </circle>
            {i < 4 ? <text className="lbl" x={(x + 9).toFixed(1)} y={(y + 4).toFixed(1)}>{name}</text> : null}
          </Link>
        );
      })}
      <circle className="pulse" cx={C} cy={C} r="9" />
      <circle cx={C} cy={C} r="9" fill="var(--accent)" stroke="var(--card)" strokeWidth="3" />
      <text className="lbl" x={C} y={C + 26} textAnchor="middle">{label.length > 22 ? "Here" : label}</text>
    </svg>
  );
}
