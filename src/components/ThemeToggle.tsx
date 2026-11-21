"use client";
import { useEffect, useState } from "react";

type Mode = "light" | "dark" | "auto";
const KEY = "wlc-theme";

function systemDark() {
  try { return window.matchMedia("(prefers-color-scheme: dark)").matches; } catch { return false; }
}
function apply(mode: Mode) {
  const el = document.documentElement;
  if (mode === "auto") el.removeAttribute("data-theme");
  else el.setAttribute("data-theme", mode);
}
function read(): Mode {
  try { const v = localStorage.getItem(KEY); return v === "light" || v === "dark" ? v : "auto"; } catch { return "auto"; }
}
function save(mode: Mode) {
  try { if (mode === "auto") localStorage.removeItem(KEY); else localStorage.setItem(KEY, mode); } catch { /* storage blocked: still applies for this visit */ }
}

/** Sun or moon in the header: one tap switches between light and dark. */
export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => {
    const m = read();
    setDark(m === "auto" ? systemDark() : m === "dark");
  }, []);
  const flip = () => {
    const next: Mode = dark ? "light" : "dark";
    apply(next); save(next); setDark(!dark);
  };
  const label = dark ? "Switch to light mode" : "Switch to dark mode";
  return (
    <button className="iconbtn" type="button" onClick={flip} aria-label={label} title={label} suppressHydrationWarning>
      {dark ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
        </svg>
      )}
    </button>
  );
}

/** Footer link back to following the phone's own setting. */
export function ThemeAuto() {
  const [manual, setManual] = useState(false);
  useEffect(() => { setManual(read() !== "auto"); }, []);
  if (!manual) return null;
  return (
    <button type="button" className="linkbtn" onClick={() => { apply("auto"); save("auto"); setManual(false); location.reload(); }}>
      Match my phone&apos;s light or dark setting
    </button>
  );
}

/** Runs before the page paints, so a saved choice never flashes the wrong colours. */
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;
