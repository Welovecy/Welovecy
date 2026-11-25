"use client";
import { useEffect, useState } from "react";

const KEY = "wlc-consent";
/** Microsoft Clarity project for welovecy.com (a public ID, safe to keep in code). */
const CLARITY = process.env.NEXT_PUBLIC_CLARITY_ID || "zitl4a1c8f";
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
      <p><strong>We use cookies</strong><br />We use cookies to understand how people use our site and to improve it.</p>
      <div className="consent-btns">
        <button type="button" className="btn btn-ghost" onClick={() => pick("no")}>Decline</button>
        <button type="button" className="btn btn-primary" onClick={() => pick("yes")}>Accept</button>
      </div>
    </div>
  );
}

export function CookieSettings() {
  if (!CLARITY) return null;
  return <button type="button" className="linkbtn" onClick={() => window.dispatchEvent(new Event("wlc:cookies"))}>Cookie settings</button>;
}
