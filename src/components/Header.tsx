"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Mark, PinIcon, SearchIcon } from "./Icons";
import { useSaved } from "@/lib/store";
import { ThemeToggle } from "./ThemeToggle";

const NAV: [string, string][] = [
  ["/destinations", "Destinations"],
  ["/must-see", "Must-see"],
  ["/beaches", "Beaches"],
  ["/stay", "Where to stay"],
  ["/around", "Around you"],
];

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const saved = useSaved();
  useEffect(() => setOpen(false), [path]);
  const cur = (h: string) => (path === h || path.startsWith(h + "/") ? "page" : undefined);
  return (
    <header className="top">
      <div className="wrap">
        <Link className="brand" href="/" aria-label="We Love Cyprus, home">
          <Mark />
          We Love Cyprus
        </Link>
        <nav className="mainnav" aria-label="Main">
          {NAV.map(([h, l]) => (
            <Link key={h} href={h} aria-current={cur(h)}>{l}</Link>
          ))}
          <Link href="/saved" aria-current={cur("/saved")}>
            Saved{saved.length ? ` (${saved.length})` : ""}
          </Link>
        </nav>
        <div className="tools">
          <ThemeToggle />
          <Link className="iconbtn hide-sm" href="/around" aria-label="Around your hotel" title="Around your hotel"><PinIcon /></Link>
          <Link className="iconbtn hide-sm" href="/search" aria-label="Search" title="Search"><SearchIcon /></Link>
          <button
            className="iconbtn menubtn" type="button" aria-expanded={open} aria-controls="sheet"
            aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </div>
      <div className="sheet" id="sheet" hidden={!open}>
        <nav className="wrap" aria-label="Main, mobile">
          {NAV.map(([h, l]) => <Link key={h} href={h}>{l}</Link>)}
          <Link href="/saved">Saved{saved.length ? ` (${saved.length})` : ""}</Link>
          <Link href="/buses">Buses</Link>
          <Link href="/essentials">Essentials</Link>
          <Link href="/practical">Practical info</Link>
        </nav>
      </div>
    </header>
  );
}
