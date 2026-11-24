"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface DemoRow { k: string; label: string; name: string; time: string; mode?: "walk" | "drive"; color: string; extra?: string }
export interface DemoStop {
  name: string; area: string; href: string; rows: DemoRow[];
  /** headline around the typed words; hotels use "Staying at" … "?" */
  pre?: string; post?: string; typed?: string; cta?: string;
}

const TYPE_MS = 55, ERASE_MS = 28, HOLD_MS = 3200;

/** "Staying at ___?" types a real hotel, then the card answers with what's around it. */
export function HeroDemo({ stops }: { stops: DemoStop[] }) {
  const [i, setI] = useState(0);
  const word = (n: number) => stops[n].typed ?? stops[n].name;
  const [typed, setTyped] = useState(stops[0] ? word(0) : "");
  // open on a finished answer: the first two seconds already show what the site does
  const [phase, setPhase] = useState<"typing" | "shown" | "erasing">("shown");
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    try { reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { /* default motion */ }
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (paused || !stops.length) return;
    const target = word(i);
    let t: ReturnType<typeof setTimeout>;
    if (reduced.current) {
      t = setTimeout(() => { const n = (i + 1) % stops.length; setI(n); setTyped(word(n)); }, 6000);
    } else if (phase === "typing") {
      t = typed.length < target.length
        ? setTimeout(() => setTyped(target.slice(0, typed.length + 1)), TYPE_MS)
        : setTimeout(() => setPhase("shown"), 120);
    } else if (phase === "shown") {
      t = setTimeout(() => setPhase("erasing"), stops[i].cta ? HOLD_MS + 1200 : HOLD_MS);
    } else {
      t = typed.length > 0
        ? setTimeout(() => setTyped(typed.slice(0, -1)), ERASE_MS)
        : setTimeout(() => { setI((i + 1) % stops.length); setPhase("typing"); }, 150);
    }
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed, phase, i, paused, stops]);

  const s = stops[i];
  if (!s) return null;
  const show = ready && (phase === "shown" || reduced.current);
  return (
    <div className="demo" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
      <h2 className="demo-title">
        <span className="demo-pre">{s.pre ?? "Staying at"}</span>{" "}
        <span className="demo-typed" aria-hidden="true">{typed}<span className={`caret${phase === "shown" ? " blink" : ""}`} /></span>
        <span className="sr">{word(i)}</span>{s.post ?? "?"}
      </h2>
      <Link href={s.href} className={`demo-card${ready ? " ready" : ""}${show ? " in" : " busy"}${s.cta ? " final" : ""}`} aria-label={s.cta ? s.cta : `See what's around ${s.name}, ${s.area}`}>
        <div className="demo-head">
          <span className="demo-pin" aria-hidden="true" />
          <span><strong>{s.name}</strong><span className="demo-area">{s.area}</span></span>
        </div>
        <ul className="demo-rows">
          {s.rows.map((r, n) => (
            <li key={s.name + r.k} style={{ transitionDelay: show ? `${120 + n * 110}ms` : "0ms" }}>
              <span className="demo-dot" style={{ background: r.color }} aria-hidden="true" />
              <span className="demo-label">{r.label}</span>
              <span className="demo-name">{r.name}{r.extra ? <em> · {r.extra}</em> : null}</span>
              <span className="demo-time">
                {r.time}
                {r.mode ? (
                  <>
                    <span className="mode-word"> {r.mode}</span>
                    <svg className="mode-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-label={r.mode === "walk" ? "walk" : "drive"} role="img">
                      {r.mode === "walk"
                        ? <><circle cx="13" cy="4" r="2" /><path d="m9 21 2.5-6.5L14 17v4M7 12l3-4h4l2 4 3 1M11.5 14.5 10 8" /></>
                        : <><path d="M5 17h14v-5l-2-5H7l-2 5z" /><circle cx="8" cy="17" r="1.6" /><circle cx="16" cy="17" r="1.6" /></>}
                    </svg>
                  </>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
        <span className="demo-cta">{s.cta ?? "See everything around it"} <span aria-hidden="true">→</span></span>
        <span className="demo-progress" key={s.name + phase} style={{ animationDuration: s.cta ? `${HOLD_MS + 1200}ms` : undefined }} data-run={phase === "shown" && !paused ? "1" : "0"} />
      </Link>
      <div className="demo-dots" role="tablist" aria-label="Examples">
        {stops.map((x, n) => (
          <button key={x.name} type="button" role="tab" aria-selected={n === i} aria-label={x.cta ? "Everything in one place" : `${x.name}, ${x.area}`}
            onClick={() => { setI(n); setTyped(word(n)); setPhase("shown"); }} />
        ))}
      </div>
    </div>
  );
}
