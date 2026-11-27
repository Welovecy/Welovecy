"use client";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { track } from "@vercel/analytics";
import { toggleSaved, useSaved, useBase, setBase, type SavedItem, type Base } from "@/lib/store";
import { km, howFar } from "@/lib/geo";
import { openAphrodite } from "./Ask";
import { KindIcon } from "./KindIcon";
import type { AroundKind, LL } from "@/lib/types";

export interface NearItem { href: string; n: string; k: AroundKind; meta: string; dir: string }

/* ---------- One row of round actions, like a place card in a maps app ---------- */
const I = {
  dir: "M3 11 21 3l-8 18-2-8Z",
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2ZM9 4v14M15 6v14",
  call: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
  web: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9Z",
  share: "M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6",
  ask: "M4 5h16v11H9l-5 4Z",
};
function Act({ href, icon, label, onClick, on, ev, external, children }: { href?: string; icon: string; label: string; onClick?: () => void; on?: boolean; ev?: string; external?: boolean; children?: ReactNode }) {
  const inner = (
    <>
      <span className="act-ic">{children ?? <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icon} /></svg>}</span>
      <span className="act-l">{label}</span>
    </>
  );
  if (href) return <a className="act" href={href} data-ev={ev} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{inner}</a>;
  return <button className="act" type="button" onClick={onClick} aria-pressed={on}>{inner}</button>;
}

export function ActionBar({ dir, around, tel, web, save, ask }: { dir?: string; around?: string; tel?: string; web?: string; save: SavedItem; ask?: string }) {
  const saved = useSaved();
  const on = saved.some((x) => x.key === save.key);
  const [shared, setShared] = useState("");
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: save.n, url }); try { track("Share", { page: save.href }); } catch {} return; }
      await navigator.clipboard.writeText(url); setShared("Copied");
    } catch { setShared(""); }
    setTimeout(() => setShared(""), 1600);
  };
  return (
    <div className="actbar" role="group" aria-label="Actions">
      {dir ? <Act href={dir} icon={I.dir} label="Directions" ev="Map" external /> : null}
      {around ? <Act href={around} icon={I.map} label="Around" /> : null}
      {tel ? <Act href={`tel:${tel}`} icon={I.call} label="Call" ev="Call" /> : null}
      {web && !tel ? <Act href={web} icon={I.web} label="Website" ev="Outbound" external /> : null}
      <Act icon="" label={on ? "Saved" : "Save"} on={on} onClick={() => toggleSaved(save)}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>
      </Act>
      <Act icon={I.share} label={shared || "Share"} onClick={share} />
      {ask ? <Act icon={I.ask} label="Ask" onClick={() => openAphrodite(ask)} /> : null}
    </div>
  );
}

/* ---------- How far from where you're staying, or a gentle way to set it ---------- */
export function FromYou({ ll, skip, stayAs }: { ll: LL; skip?: string; stayAs?: Base }) {
  const base = useBase();
  if (stayAs) {
    const mine = base?.id === stayAs.id;
    return (
      <div className="fromyou">
        <span>{mine ? <>This is <b>your base</b>. Everything around is measured from here.</> : <>Staying here? Set it as your base to see what&apos;s close.</>}</span>
        <button type="button" className={mine ? "btn btn-ghost" : "btn btn-primary"} onClick={() => setBase(mine ? null : stayAs)}>{mine ? "Not staying here" : "I'm staying here"}</button>
      </div>
    );
  }
  if (!base || base.id === skip) return null;
  return (
    <div className="fromyou">
      <span><b>{howFar(km(base.ll, ll))}</b> from {base.n}</span>
      <Link href={base.around} className="dlink">Around {base.n.length > 18 ? "your base" : base.n} <span aria-hidden="true">›</span></Link>
    </div>
  );
}

/* ---------- Nearby, one kind at a time ---------- */
export function NearbyTabs({ groups }: { groups: { k: AroundKind; label: string; items: NearItem[] }[] }) {
  const [cur, setCur] = useState(groups[0].k);
  const g = groups.find((x) => x.k === cur) ?? groups[0];
  return (
    <div className="ntabs">
      {groups.length > 1 ? (
        <div className="seg" role="tablist" aria-label="Nearby">
          {groups.map((x) => <button key={x.k} role="tab" type="button" aria-selected={x.k === g.k} onClick={() => setCur(x.k)}>{x.label}</button>)}
        </div>
      ) : <h3 className="dsec-sub">{g.label} nearby</h3>}
      <ul className="nlist" role="tabpanel">
        {g.items.map((it) => (
          <li key={it.href + it.n}>
            <Link href={it.href} className="nrow">
              <KindIcon k={it.k} size={40} />
              <span className="nrow-t"><b>{it.n}</b><small>{it.meta}</small></span>
            </Link>
            <a className="ndir" href={it.dir} target="_blank" rel="noopener noreferrer" aria-label={`Directions to ${it.n}`} data-ev="Map">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 11 21 3l-8 18-2-8Z" /></svg>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
