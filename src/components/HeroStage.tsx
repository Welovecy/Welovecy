import type { Photo as P } from "@/lib/types";
import { Photo } from "./Photo";

const WAVE = "M0 60 Q150 20 300 60 T600 60 T900 60 T1200 60 V120 H0 Z";
const SPARKS: [number, number, number][] = [[18, 40, 0], [32, 70, 1.2], [47, 30, 2.1], [61, 62, 0.6], [74, 38, 3.0], [86, 66, 1.7], [25, 15, 3.6], [68, 12, 2.6]];

/** Aphrodite rising from the foam: slow light, drifting sea and a heart that rises once. Off with reduced motion. */
export function HeroStage({ photo, label, tint }: { photo?: P; label: string; tint: string }) {
  return (
    <div className="stage">
      <Photo photo={photo} label={label} tint={tint} ratio="16/9" priority hero className="hero-photo" />
      <svg className="sea back" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true"><path d={WAVE} fill="#FFFFFF" /></svg>
      <svg className="sea" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true" style={{ opacity: 0.55 }}><path d={WAVE} fill="#FFFFFF" /></svg>
      <div className="sparkles" aria-hidden="true">
        {SPARKS.map(([l, t, d], i) => <i key={i} style={{ left: `${l}%`, top: `${t}%`, animationDelay: `${d}s` }} />)}
      </div>
      <div className="foam" aria-hidden="true">
        <svg className="heart-rise" viewBox="0 0 24 24" width="100%"><path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z" fill="#FFFFFF" /></svg>
        <span className="ring" />
      </div>
    </div>
  );
}
