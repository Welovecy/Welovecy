"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { clearSaved, useSaved } from "@/lib/store";
import { SaveButton } from "./SaveButton";

export function SavedList() {
  const list = useSaved();
  const [ready, setReady] = useState(false);
  const [confirm, setConfirm] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return <p className="hint">Loading your list…</p>;
  if (!list.length) {
    return (
      <div className="empty">
        <h2 style={{ fontSize: 24 }}>Start your list.</h2>
        <p className="muted">Tap the heart on any place, beach or hotel to keep it here.</p>
        <Link className="btn btn-primary" href="/must-see">Find something to love</Link>
      </div>
    );
  }
  return (
    <>
      <p className="dir-count" style={{ marginBottom: 10 }}>{list.length} saved. Kept on this device, no account needed.</p>
      <ul className="rows">
        {list.map((x) => (
          <li key={x.key}>
            <Link className="row" href={x.href}>
              <span className="mono" aria-hidden="true">{x.n.slice(0, 1).toUpperCase()}</span>
              <span className="rowtxt"><strong>{x.n}</strong>{x.sub ? <span>{x.sub}</span> : null}</span>
            </Link>
            <SaveButton compact item={x} />
          </li>
        ))}
      </ul>
      <div className="actions" style={{ marginTop: 20 }}>
        {confirm ? (
          <>
            <span className="muted" style={{ alignSelf: "center" }}>Remove everything from your list?</span>
            <button className="btn btn-ghost" type="button" onClick={() => { clearSaved(); setConfirm(false); }}>Yes, clear it</button>
            <button className="btn btn-ghost" type="button" onClick={() => setConfirm(false)}>Keep it</button>
          </>
        ) : <button className="btn btn-ghost" type="button" onClick={() => setConfirm(true)}>Clear list</button>}
      </div>
    </>
  );
}
