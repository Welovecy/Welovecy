"use client";
import Link from "next/link";
import { setBase, useBase } from "@/lib/store";
import { WhereSearch } from "./WhereSearch";

export function AroundHome() {
  const base = useBase();
  return (
    <div className="hero-copy">
      <h1 className="h-page">{base ? "Around you" : "Where are you staying?"}</h1>
      {base ? (
        <div className="around-head" style={{ marginTop: 0 }}>
          <p className="eyebrow">Your base</p>
          <h2 style={{ fontSize: "clamp(28px,4vw,40px)" }}>{base.n}</h2>
          <div className="actions">
            <Link className="btn btn-primary" href={base.around}>See what&apos;s around</Link>
            <Link className="btn btn-ghost" href={base.href}>Hotel details</Link>
            <button className="btn btn-ghost" type="button" onClick={() => setBase(null)}>Change hotel</button>
          </div>
        </div>
      ) : (
        <p className="lead">Find your hotel and see the beaches, sights and essentials closest to it, with distances to everything. Still choosing? It works the same way.</p>
      )}
      {base ? null : <WhereSearch scope="stay" placeholder="Type your hotel's name" label="Find your hotel" />}
      <p className="hint">Just visiting somewhere? Open any beach or sight and tap &quot;See what&apos;s around&quot;.</p>
    </div>
  );
}
