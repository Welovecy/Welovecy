import type { LL } from "@/lib/types";
import { aroundData } from "@/lib/views";
import { getDest } from "@/lib/data";
import { EssentialsGrid } from "./Essentials";
import { NearRow } from "./NearRow";

const GROUPS: [Parameters<ReturnType<typeof aroundData>["near"]>[0], string][] = [
  ["beach", "Beaches nearby"], ["sight", "Sights nearby"], ["eat", "Eat & drink nearby"],
];

/** Compact "what's around" for detail pages. The full explorer lives on the /around page. */
export function AroundBlock({ ll, skip, title, moreHref }: { ll: LL; skip?: string; title: string; moreHref?: string }) {
  const a = aroundData(ll, skip);
  const dest = getDest(a.dest);
  return (
    <section className="wrap" aria-labelledby="h-around">
      <div className="sec-head">
        <h2 id="h-around">{title}</h2>
        {moreHref ? <a href={moreHref}>Everything around, with a map</a> : null}
      </div>
      <EssentialsGrid items={a.essentials} area={a.dest} areaName={dest?.name ?? ""} busHref={moreHref ? `${moreHref}#buses` : undefined} />
      <div className="near-cols" style={{ marginTop: 28 }}>
        {GROUPS.map(([k, t]) => {
          const list = a.near(k, 4).filter((n) => n.d <= 25);
          return list.length ? (
            <div key={k} className="near-group">
              <h3 style={{ fontSize: 20 }}>{t}</h3>
              <ul className="rows">{list.map((n) => <NearRow key={n.s.key} n={n} />)}</ul>
            </div>
          ) : null;
        })}
      </div>
    </section>
  );
}
