"use client";
import { useState } from "react";
import { HeartIcon } from "./Icons";
import { toggleSaved, useSaved, type SavedItem } from "@/lib/store";

export function SaveButton({ item, compact }: { item: SavedItem; compact?: boolean }) {
  const saved = useSaved();
  const on = saved.some((x) => x.key === item.key);
  const [note, setNote] = useState("");
  const onClick = () => {
    const now = toggleSaved(item);
    setNote(now ? `${item.n} saved` : `${item.n} removed`);
  };
  const label = `${on ? "Remove" : "Save"} ${item.n}`;
  return (
    <>
      <button className={compact ? "heart" : "save"} type="button" aria-pressed={on} aria-label={label} onClick={onClick}>
        <HeartIcon filled={on} />
        {compact ? null : <span>{on ? "Saved" : "Save"}</span>}
      </button>
      <span className="sr" role="status">{note}</span>
    </>
  );
}
