"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "wlc-consent";
const CLARITY = process.env.NEXT_PUBLIC_CLARITY_ID;
type Choice = "yes" | "no";

function read(): Choice | null { try { const v = localStorage.getItem(KEY); return v === "yes" || v === "no" ? v : null; } catch { return null; } }
function save(v: Choice) { try { localStorage.setItem(KEY, v); } catch {} }

/** Microsoft Clarity only loads after a yes. */
function loadClarity() {
  if (!CLARITY || (window as unknown as { clarity?: unknown }).clarity) return;
  const w = window as unknown as Record<string, unknown> & { clarity?: { q?: unknown[] } & ((...a: unknown[]) => void) };
  w.clarity = w.clarity || (function (...a: unknown[]) { ((w.clarity as { q?: unknown[] }).q = (w.clarity as { q?: unknown[] }).q || []).push(a); } as never);
  const s = document.createElement("script");
  s.async = true; s.src = `https://www.clarity.ms/tag/${CLARITY}`;
  document.head.appendChild(s);
  (w.clarity as (...a: unknown[]) => void)("consent");
}

/** Small banner for the optional cookies. Without a Clarity project there's nothing to ask, so it stays hidden. */
export function Consent() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!CLARITY) return;
    const c = read();
    if (c === "yes") loadClarity();
    if (c === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener("wlc:cookies", reopen);
    return () => window.removeEventListener("wlc:cookies", reopen);
  }, []);
  if (!open) return null;
  const pick = (v: Choice) => {
    save(v); setOpen(false);
    if (v === "yes") loadClarity();
    else if (read() === "no" && (window as unknown as { clarity?: unknown }).clarity) location.reload();
  };
  return (
    <div className="consent" role="dialog" aria-live="polite" aria-label="Cookies">
      <p><strong>Help us make this better?</strong> With your OK, we use cookies to see which pages help and where people get stuck. No ads, and we never sell data. <Link href="/privacy">Privacy</Link></p>
      <div className="consent-btns">
        <button type="button" className="btn btn-ghost" onClick={() => pick("no")}>No thanks</button>
        <button type="button" className="btn btn-primary" onClick={() => pick("yes")}>That&apos;s fine</button>
      </div>
    </div>
  );
}

export function CookieSettings() {
  if (!CLARITY) return null;
  return <button type="button" className="linkbtn" onClick={() => window.dispatchEvent(new Event("wlc:cookies"))}>Cookie settings</button>;
}
