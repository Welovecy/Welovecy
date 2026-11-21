import Link from "next/link";
import { howFar } from "@/lib/geo";
import { ESSENTIAL_LABEL, KINDS } from "@/lib/kinds";
import type { Essential } from "@/lib/around";
import { KindDot } from "./Bits";

export function EssentialsGrid({ items, area, areaName, busHref }: { items: Essential[]; area: string; areaName: string; busHref?: string }) {
  return (
    <div className="essentials">
      {items.map(({ kind, near }) => {
        const K = KINDS[kind];
        if (!near) {
          const href = kind === "beach" ? `/beaches` : kind === "bus" ? `/buses` : kind === "eat" ? `/destinations/${area}` : `/essentials/${area}/${kind}`;
          return (
            <Link key={kind} className="ess" href={href}>
              <span className="label"><KindDot color={K.c} />{ESSENTIAL_LABEL[kind] ?? K.n}</span>
              <strong>Not mapped near here yet</strong>
              <span className="muted small">{kind === "beach" ? "See every beach" : kind === "bus" ? "See bus routes" : `See ${areaName}`}</span>
            </Link>
          );
        }
        return (
          <Link key={kind} className="ess" href={kind === "bus" && busHref ? busHref : near.s.href}>
            <span className="label"><KindDot color={K.c} />{ESSENTIAL_LABEL[kind] ?? `Nearest ${K.one.toLowerCase()}`}</span>
            <strong>{near.s.n}</strong>
            {kind === "bus" && near.s.rt?.length ? <span className="routes">Routes {near.s.rt.slice(0, 6).join(", ")}{near.s.rt.length > 6 ? " +" : ""}</span> : null}
            <span className="muted small">{howFar(near.d)}</span>
          </Link>
        );
      })}
    </div>
  );
}
