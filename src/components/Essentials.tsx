import Link from "next/link";
import { howFar } from "@/lib/geo";
import { KINDS } from "@/lib/kinds";
import type { Essential } from "@/lib/around";
import { KindDot } from "./Bits";

export function EssentialsGrid({ items, area, areaName }: { items: Essential[]; area: string; areaName: string }) {
  return (
    <div className="essentials">
      {items.map(({ kind, near }) => {
        const K = KINDS[kind];
        if (!near) {
          const href = kind === "beach" ? `/beaches` : `/essentials/${area}/${kind}`;
          return (
            <Link key={kind} className="ess" href={href}>
              <span className="label"><KindDot color={K.c} />{K.n}</span>
              <strong>Not mapped near here yet</strong>
              <span className="muted small">{kind === "beach" ? "See every beach" : `See the full list for ${areaName}`}</span>
            </Link>
          );
        }
        return (
          <Link key={kind} className="ess" href={near.s.href}>
            <span className="label"><KindDot color={K.c} />Nearest {K.one.toLowerCase()}</span>
            <strong>{near.s.n}</strong>
            <span className="muted small">{howFar(near.d)}</span>
          </Link>
        );
      })}
    </div>
  );
}
