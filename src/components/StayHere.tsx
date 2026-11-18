"use client";
import { setBase, useBase, type Base } from "@/lib/store";

export function StayHere({ base }: { base: Base }) {
  const cur = useBase();
  if (cur?.id === base.id) {
    return (
      <span className="actions" style={{ alignItems: "center" }}>
        <span className="flag flag-accent">Your base</span>
        <button className="btn btn-ghost" type="button" onClick={() => setBase(null)}>Not staying here</button>
      </span>
    );
  }
  return (
    <button className="btn btn-primary" type="button" onClick={() => setBase(base)}>
      I&apos;m staying here
    </button>
  );
}
