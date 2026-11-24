"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useWeather } from "./Weather";
import { DEST_CENTRE } from "@/lib/centres";
import { cyTime, sunTimes, symbolInfo } from "@/lib/weather";

/** Phones get the tall cut, everything else the wide one. Same breakpoint for the still and the video. */
const TALL = "(max-width: 700px)";
const V = {
  tall: { src: "/video/nissi-sunrise-tall.mp4", poster: "/video/nissi-sunrise-tall.jpg" },
  wide: { src: "/video/nissi-sunrise-wide.mp4", poster: "/video/nissi-sunrise-wide.jpg" },
};

/**
 * Opening screen: Nissi Beach at sunrise. A still shows at once; the muted loop fades in once it can play.
 * No video with reduced motion or Data Saver, and a pause button for everyone else.
 */
export function HomeHero({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const save = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || save) return;
    setSrc(matchMedia(TALL).matches ? V.tall.src : V.wide.src);
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setPaused(false); } else { v.pause(); setPaused(true); }
  };

  return (
    <div className="vhero">
      <picture>
        <source media={TALL} srcSet={V.tall.poster} />
        <img className="vhero-media" src={V.wide.poster} alt="" fetchPriority="high" />
      </picture>
      {src ? (
        <video
          ref={ref}
          className={`vhero-media vhero-video${playing ? " on" : ""}`}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          onPlaying={() => setPlaying(true)}
        />
      ) : null}
      <div className="vhero-inner">{children}</div>
      {src && playing ? (
        <button type="button" className="vhero-pause" onClick={toggle} aria-label={paused ? "Play the background video" : "Pause the background video"}>
          {paused ? <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
            : <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" /></svg>}
        </button>
      ) : null}
    </div>
  );
}

/** Live line under the headline: weather now, today's sunset and how many pharmacies are open tonight. */
export function RightNow({ pharmacies }: { pharmacies: number }) {
  const w = useWeather("ayianapa");
  const [sunset, setSunset] = useState<string | null>(null);
  useEffect(() => { setSunset(cyTime(sunTimes(new Date(), DEST_CENTRE.ayianapa).set)); }, []);
  return (
    <ul className="now-line" aria-label="Cyprus right now">
      <li>
        <Link href="/weather">
          {w ? <><strong>{w.t}°</strong> {symbolInfo(w.sym).label.toLowerCase()}</> : <strong>Weather</strong>}
          <span className="now-sub">Ayia Napa</span>
        </Link>
      </li>
      <li>
        <Link href="/weather">
          <strong>{sunset ?? "Sunset"}</strong> sunset
          <span className="now-sub">Today</span>
        </Link>
      </li>
      {pharmacies > 0 ? (
        <li>
          <Link href="/pharmacies-on-duty">
            <strong>{pharmacies}</strong> pharmacies
            <span className="now-sub">Open tonight</span>
          </Link>
        </li>
      ) : null}
    </ul>
  );
}

const ICON: Record<string, ReactNode> = {
  beach: <path d="M12 3a8 8 0 0 1 8 8H4a8 8 0 0 1 8-8zm0 8v8m-6 2h12" />,
  eat: <path d="M7 3v8m-2-8v5a2 2 0 0 0 4 0V3m-2 8v10M16 3c-2 1-3 4-3 7h3v11" />,
  bus: <path d="M6 4h12a2 2 0 0 1 2 2v10H4V6a2 2 0 0 1 2-2zm-2 8h16M7 16v3m10-3v3M8 13.5h.01M16 13.5h.01" />,
  pharmacy: <path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z" />,
};

/** The four things people look for first. One row on a phone, no sideways scrolling. */
export function QuickLinks() {
  const links: [string, string, string][] = [
    ["beach", "Beaches", "/beaches"],
    ["eat", "Eat out", "/eat-drink"],
    ["bus", "Buses", "/buses"],
    ["pharmacy", "Pharmacy", "/pharmacies-on-duty"],
  ];
  return (
    <nav className="quick" aria-label="Start here">
      {links.map(([k, label, href]) => (
        <Link key={k} href={href} className="quick-link">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICON[k]}</svg>
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
