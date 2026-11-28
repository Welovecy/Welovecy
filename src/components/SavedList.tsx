"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { clearSaved, useBase, useSaved, type SavedItem } from "@/lib/store";
import type { AroundKind } from "@/lib/types";
import { SaveButton } from "./SaveButton";
import { KindIcon } from "./KindIcon";
import { AppHead } from "./Bits";
import { openAphrodite } from "./Ask";

/** href → [small photo, kind] */
export type SavedMeta = Record<string, [string | undefined, AroundKind]>;

type Group = "all" | "beach" | "see" | "food" | "stay";
const GROUPS: [Group, string][] = [["all", "All"], ["beach", "Beaches"], ["see", "Sights"], ["food", "Food"], ["stay", "Stays"]];

/** Best guess at the kind when we have no record of it: from the address, then the subtitle. */
function kindOf(x: SavedItem, meta: SavedMeta): AroundKind | undefined {
  const m = meta[x.href]?.[1];
  if (m) return m;
  const s = (x.sub ?? "").toLowerCase();
  if (/\/listing\/bea-/.test(x.href) || /\bbeach\b/.test(s)) return "beach";
  if (/hotel|apartment|villa/.test(s)) return "stay";
  if (/bar|club|nightlife/.test(s)) return "night";
  if (/restaurant|taverna|caf|bakery|eat/.test(s)) return "eat";
  if (/sight|museum|church|monastery|park|castle|unesco/.test(s)) return "sight";
  return undefined;
}
/** Your lists as a stack of passes, with where you're staying at the front. Tap a pass to see only that list. */
function Wallet({ passes, on, pick, front }: { passes: { id: Group; label: string; n: number; img?: string; k?: AroundKind }[]; on: Group; pick: (id: Group) => void; front: React.ReactNode }) {
  if (passes.length < 2 && !front) return null;
  return (
    <div className="wallet" role="group" aria-label="Your lists">
      {passes.length > 1 ? passes.map((p, i) => (
        <button key={p.id} type="button" className="pass" aria-pressed={on === p.id} onClick={() => pick(p.id)} style={{ ["--i" as string]: i }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {p.img ? <img src={p.img} alt="" /> : <span className="pass-k">{p.k ? <KindIcon k={p.k} size={44} /> : null}</span>}
          <span className="pass-t"><b>{p.label}</b><span>{p.n} {p.n === 1 ? "place" : "places"}</span></span>
        </button>
      )) : null}
      {front ? <div className="pass-front" style={{ ["--i" as string]: passes.length }}>{front}</div> : null}
    </div>
  );
}

const groupOf = (k?: AroundKind): Group => (k === "beach" ? "beach" : k === "stay" ? "stay" : k === "eat" || k === "night" ? "food" : "see");

export function SavedList({ meta, emptyPics }: { meta: SavedMeta; emptyPics: string[] }) {
  const list = useSaved();
  const base = useBase();
  const [ready, setReady] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [g, setG] = useState<Group>("all");
  const [shared, setShared] = useState("");
  useEffect(() => setReady(true), []);

  const rows = list.map((x) => ({ x, k: kindOf(x, meta), img: meta[x.href]?.[0] }));
  const present = new Set(rows.map((r) => groupOf(r.k)));
  const groups = GROUPS.filter(([id]) => id === "all" || present.has(id));
  const shown = g === "all" ? rows : rows.filter((r) => groupOf(r.k) === g);

  const share = async () => {
    const text = list.map((x) => `${x.n}: ${location.origin}${x.href}`).join("\n");
    try {
      if (navigator.share) { await navigator.share({ title: "My Cyprus list", text }); return; }
      await navigator.clipboard.writeText(text); setShared("Copied");
    } catch { /* closed the share sheet */ }
    setTimeout(() => setShared(""), 1600);
  };

  const head = (
    <AppHead
      title="Your Cyprus" sub={ready && list.length ? `${list.length} saved on this device` : undefined} crumbs={[["Home", "/"], ["Saved"]]}
      action={ready && list.length ? (
        <button type="button" className="round-btn" onClick={share} aria-label={shared || "Share your list"}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></svg>
        </button>
      ) : undefined}
    />
  );

  const baseImg = base ? meta[base.href]?.[0] : undefined;
  const baseCard = base ? (
    <Link href={base.around} className="base-card">
      <span className="base-pic">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {baseImg ? <img src={baseImg} alt="" /> : <KindIcon k="stay" size={48} />}
        <span className="base-eye">Where I&apos;m staying</span>
      </span>
      <span className="base-body">
        <b>{base.n}</b>
        <span className="base-go">See what&apos;s around <span aria-hidden="true">›</span></span>
      </span>
    </Link>
  ) : null;

  if (!ready) return <div className="app-page">{head}<div className="wrap" style={{ minHeight: "50vh" }} /></div>;
  if (!list.length) {
    return (
      <div className="app-page">
        {head}
        <div className="wrap saved-wrap">
          {baseCard}
          <div className="empty-fan">
            <div className="fan" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {emptyPics.map((u) => <img key={u} src={u} alt="" />)}
            </div>
            <h2>Start your list.</h2>
            <p className="muted">Tap the heart on any beach, sight or hotel and it lands here. No account needed.</p>
            <Link className="btn btn-primary" href="/must-see">Find something to love</Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="app-page">
      {head}
      <div className="wrap saved-wrap">
        <Wallet
          passes={groups.filter(([id]) => id !== "all").map(([id, label]) => {
            const items = rows.filter((r) => groupOf(r.k) === id);
            return { id, label, n: items.length, img: items.find((r) => r.img)?.img, k: items[0]?.k };
          })}
          on={g} pick={(id) => setG(g === id ? "all" : id)} front={baseCard}
        />
        <ul className="rows rows-flat">
          {shown.map(({ x, k, img }) => (
            <li key={x.key}>
              <Link className="row" href={x.href}>
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="row-img" src={img} alt="" loading="lazy" decoding="async" width={52} height={52} />
                ) : k ? <KindIcon k={k} size={44} /> : <span className="mono" aria-hidden="true">{x.n.slice(0, 1).toUpperCase()}</span>}
                <span className="rowtxt"><strong>{x.n}</strong>{x.sub ? <span>{x.sub}</span> : null}</span>
              </Link>
              <SaveButton compact item={x} />
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn-primary wide" onClick={() => openAphrodite(`Plan a day with my saved places: ${list.slice(0, 8).map((x) => x.n).join(", ")}`)}>Plan a day with these</button>
        <div className="actions" style={{ justifyContent: "center" }}>
          {confirm ? (
            <>
              <span className="muted" style={{ alignSelf: "center" }}>Remove everything from your list?</span>
              <button className="btn btn-ghost" type="button" onClick={() => { clearSaved(); setConfirm(false); }}>Yes, clear it</button>
              <button className="btn btn-ghost" type="button" onClick={() => setConfirm(false)}>Keep it</button>
            </>
          ) : <button className="linkbtn" type="button" onClick={() => setConfirm(true)}>Clear list</button>}
        </div>
      </div>
    </div>
  );
}
