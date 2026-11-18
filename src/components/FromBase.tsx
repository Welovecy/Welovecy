"use client";
import Link from "next/link";
import { km, howFar, directionsTo } from "@/lib/geo";
import { useBase } from "@/lib/store";
import type { LL } from "@/lib/types";

/** "1.2 km · 15 min walk from Your Hotel", shown once a visitor has told us where they're staying. */
export function FromBase({ ll, skip }: { ll: LL; skip?: string }) {
  const base = useBase();
  if (!base || base.id === skip) return null;
  return (
    <p className="basebar">
      <span><strong>{howFar(km(base.ll, ll))}</strong> from <Link href={base.around}>{base.n}</Link></span>
      <a href={directionsTo(ll)} target="_blank" rel="noopener noreferrer">Directions</a>
    </p>
  );
}

export function DistanceTag({ ll }: { ll?: LL }) {
  const base = useBase();
  if (!base || !ll) return null;
  return <p className="tag" style={{ marginTop: 6 }}>{howFar(km(base.ll, ll))} from {base.n}</p>;
}
