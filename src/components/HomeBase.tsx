"use client";
import Link from "next/link";
import { setBase, useBase } from "@/lib/store";

export function HomeBase() {
  const base = useBase();
  if (!base) return null;
  return (
    <section className="wrap" aria-labelledby="h-base" style={{ paddingBlock: "24px 0" }}>
      <div className="basebar">
        <span id="h-base">Staying at <strong>{base.n}</strong></span>
        <span className="actions">
          <Link className="btn btn-primary" href={base.around}>What&apos;s around you</Link>
          <button className="btn btn-ghost" type="button" onClick={() => setBase(null)}>Change</button>
        </span>
      </div>
    </section>
  );
}
