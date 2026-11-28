"use client";
import { track } from "@vercel/analytics";
import { openAphrodite } from "./Ask";

type Kind = "beach" | "sight" | "nature" | "family" | "activity" | "stay" | "eat" | "night";

/** Three questions people really ask about this kind of place, each one tap away. */
function questions(k: Kind, n: string): string[] {
  switch (k) {
    case "beach": return [`Is ${n} good for kids?`, `How do I get to ${n} without a car?`, `Where can I eat near ${n}?`];
    case "stay": return [`What's walkable from ${n}?`, `How do I get from the airport to ${n}?`, `Best beach near ${n}?`];
    case "eat": case "night": return [`What else is near ${n}?`, `How do I get to ${n} by taxi?`, `Somewhere for a drink after ${n}?`];
    case "nature": return [`How hard is ${n}?`, `What should I bring for ${n}?`, `What else is near ${n}?`];
    default: return [`How long do I need at ${n}?`, `How do I get to ${n}?`, `What else is near ${n}?`];
  }
}

export function AskAbout({ name, k, page }: { name: string; k: Kind; page: string }) {
  const qs = questions(k, name);
  const ask = (q: string) => { try { track("Ask suggestion", { page: page.slice(0, 100), kind: k }); } catch {} openAphrodite(q); };
  return (
    <section className="ask-about" aria-labelledby="h-ask-about">
      <p id="h-ask-about" className="ask-about-h">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/aphrodite-96.webp" alt="" width={34} height={34} />
        <span><b>Ask Aphrodite</b><small>Our AI guide to Cyprus. Tap a question or ask your own</small></span>
      </p>
      <div className="ask-about-qs">
        {qs.map((q) => <button key={q} type="button" onClick={() => ask(q)}>{q}<span aria-hidden="true">›</span></button>)}
      </div>
    </section>
  );
}
