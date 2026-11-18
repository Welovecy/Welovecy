"use client";
import { useState } from "react";
import { AROUND_TABS, KINDS } from "@/lib/kinds";
import type { AroundKind, LL } from "@/lib/types";
import type { Near } from "@/lib/around";
import { Radar } from "./Radar";
import { NearRow } from "./NearRow";
import { KindDot } from "./Bits";

interface Props {
  center: LL;
  label: string;
  lists: Record<string, Near[]>;
  initial?: AroundKind;
}

/** Tabs by kind, a distance map and the nearest list. Data is worked out on the server. */
export function AroundExplorer({ center, label, lists, initial = "beach" }: Props) {
  const tabs = AROUND_TABS.filter(([k]) => (lists[k] || []).length);
  const first = tabs.some(([k]) => k === initial) ? initial : tabs[0]?.[0];
  const [tab, setTab] = useState<AroundKind | undefined>(first);
  const [n, setN] = useState(8);
  if (!tab) return <div className="empty"><p>Nothing mapped around here yet.</p></div>;
  const focus = lists[tab] || [];
  const others = Object.entries(lists).filter(([k]) => k !== tab).flatMap(([, v]) => v.slice(0, 12));
  return (
    <>
      <div className="chips" role="group" aria-label="Show" style={{ marginBottom: 20 }}>
        {tabs.map(([k, name]) => (
          <button key={k} className="chip" type="button" aria-pressed={tab === k} onClick={() => { setTab(k); setN(8); }}>
            <KindDot color={KINDS[k].c} /><span style={{ marginLeft: 6 }}>{name}</span>
          </button>
        ))}
      </div>
      <div className="around-grid">
        <div>
          <Radar center={center} focus={focus} others={others} kind={tab} label={label} />
          <p className="tag" style={{ marginTop: 10 }}>Straight-line distances. Walking and taxi figures are estimates.</p>
        </div>
        <div className="near-group" aria-live="polite">
          <ul className="rows">
            {focus.slice(0, n).map((x) => <NearRow key={x.s.key} n={x} />)}
          </ul>
          {focus.length > n ? (
            <button className="btn btn-ghost more" type="button" onClick={() => setN((v) => v + 12)}>Show more</button>
          ) : null}
        </div>
      </div>
    </>
  );
}
