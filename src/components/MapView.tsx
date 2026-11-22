"use client";
import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { fmtD } from "@/lib/geo";
import { KINDS } from "@/lib/kinds";
import type { AroundKind, LL } from "@/lib/types";
import type { Near } from "@/lib/around";
import { Radar } from "./Radar";

type ML = typeof import("maplibre-gl");
type MapT = import("maplibre-gl").Map;
type MarkerT = import("maplibre-gl").Marker;

const STYLE = { light: "https://tiles.openfreemap.org/styles/positron", dark: "https://tiles.openfreemap.org/styles/dark" };

function isDark() {
  const t = document.documentElement.getAttribute("data-theme");
  if (t === "dark") return true;
  if (t === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Give the sea a soft blue so the coast reads at a glance, in both themes. */
function tint(m: MapT) {
  const dark = isDark();
  for (const l of m.getStyle()?.layers ?? []) {
    if (l.type === "fill" && /^water/.test(l.id)) m.setPaintProperty(l.id, "fill-color", dark ? "#16303F" : "#CFE4F1");
    if (l.type === "background") m.setPaintProperty(l.id, "background-color", dark ? "#1E2124" : "#F6F4EF");
  }
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

interface Props { center: LL; focus: Near[]; others: Near[]; kind: AroundKind; label: string }

/**
 * A real map (MapLibre with free OpenStreetMap tiles). The first eight results are numbered to match the list.
 * Falls back to the distance radar when the map can't load: offline, no WebGL, or the tile server is down.
 */
export function MapView({ center, focus, others, kind, label }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<MapT | null>(null);
  const lib = useRef<ML | null>(null);
  const marks = useRef<MarkerT[]>([]);
  const [state, setState] = useState<"idle" | "ready" | "failed">("idle");

  // Load the library only when the map scrolls into view.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (!navigator.onLine) { setState("failed"); return; }
    let cancelled = false;
    const io = new IntersectionObserver(async (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      try {
        const ml = await import("maplibre-gl");
        if (cancelled || !box.current) return;
        lib.current = ml;
        const m = new ml.Map({
          container: box.current,
          style: isDark() ? STYLE.dark : STYLE.light,
          center: [center[1], center[0]],
          zoom: 14,
          attributionControl: { compact: true },
          cooperativeGestures: true,
          dragRotate: false,
          pitchWithRotate: false,
        });
        m.touchZoomRotate.disableRotation();
        m.addControl(new ml.NavigationControl({ showCompass: false }), "top-right");
        const timer = window.setTimeout(() => { if (!m.loaded()) setState("failed"); }, 9000);
        m.on("load", () => { window.clearTimeout(timer); setState("ready"); });
        m.on("style.load", () => tint(m));
        m.on("error", (e) => { if (!m.loaded() && /style|fetch|Failed/i.test(String(e.error?.message))) setState("failed"); });
        map.current = m;
      } catch {
        setState("failed");
      }
    }, { rootMargin: "200px" });
    io.observe(el);
    return () => { cancelled = true; io.disconnect(); map.current?.remove(); map.current = null; };
  }, [center]);

  // Follow the site's light/dark switch.
  useEffect(() => {
    const obs = new MutationObserver(() => { map.current?.setStyle(isDark() ? STYLE.dark : STYLE.light); });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  // Markers for the current tab.
  useEffect(() => {
    const m = map.current, ml = lib.current;
    if (state !== "ready" || !m || !ml) return;
    marks.current.forEach((x) => x.remove());
    marks.current = [];
    const add = (el: HTMLElement, ll: LL, html?: string) => {
      const mk = new ml.Marker({ element: el }).setLngLat([ll[1], ll[0]]);
      if (html) mk.setPopup(new ml.Popup({ offset: 14, closeButton: false, maxWidth: "260px" }).setHTML(html));
      mk.addTo(m);
      marks.current.push(mk);
    };
    const pop = (n: Near) =>
      `<a class="mp-pop" href="${esc(n.s.href)}"><b>${esc(n.s.n)}</b><span>${esc(n.s.sub || KINDS[n.s.k].n)}</span><span>${fmtD(n.d)} away</span></a>`;
    for (const n of others.slice(0, 30)) {
      const el = document.createElement("button");
      el.type = "button"; el.className = "mp-dot"; el.style.background = KINDS[n.s.k].c; el.setAttribute("aria-label", n.s.n);
      add(el, n.s.ll, pop(n));
    }
    const shown = focus.slice(0, 30);
    shown.forEach((n, i) => {
      const el = document.createElement("button");
      el.type = "button"; el.className = i < 8 ? "mp-num" : "mp-dot mp-focus"; el.style.background = KINDS[kind].c;
      if (i < 8) el.textContent = String(i + 1);
      el.setAttribute("aria-label", `${i + 1}. ${n.s.n}, ${fmtD(n.d)}`);
      add(el, n.s.ll, pop(n));
    });
    const base = document.createElement("div");
    base.className = "mp-base"; base.setAttribute("aria-label", label);
    base.innerHTML = `<svg viewBox="130 90 252 232" width="22" height="22" aria-hidden="true"><path d="M256 316 C 200 278, 136 236, 136 172 C 136 130, 168 100, 206 100 C 230 100, 248 114, 256 134 C 264 114, 282 100, 306 100 C 344 100, 376 130, 376 172 C 376 236, 312 278, 256 316 Z" fill="#fff"/></svg>`;
    add(base, center, `<div class="mp-pop"><b>${esc(label)}</b><span>Distances are measured from here</span></div>`);
    const b = new ml.LngLatBounds([center[1], center[0]], [center[1], center[0]]);
    shown.slice(0, 6).filter((n) => n.d < 12).forEach((n) => b.extend([n.s.ll[1], n.s.ll[0]]));
    m.fitBounds(b, { padding: 48, maxZoom: 16, duration: 600 });
  }, [state, focus, others, kind, center, label]);

  if (state === "failed") return <Radar center={center} focus={focus} others={others} kind={kind} label={label} />;
  return (
    <div className="mapwrap">
      <div ref={box} className="map" role="region" aria-label={`Map of ${KINDS[kind].n.toLowerCase()} around ${label}`} />
      {state !== "ready" ? <div className="map-wait" aria-hidden="true">Loading map</div> : null}
    </div>
  );
}
