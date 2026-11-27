import knowJson from "@data/knowledge.json";
import { norm } from "./text";

/** Know before you go: short checked facts with sources (data/knowledge.json). Used by the page and by Aphrodite. */
export interface KSrc { t: string; u: string }
export interface KFact { id: string; sec: string; q: string; t: string; src: KSrc[]; topic?: string; period?: string; dates?: string; what?: string; see?: string }
export interface KSection { id: string; title: string; lead: string; own?: string }
const K = knowJson as unknown as { checked: string; sections: KSection[]; facts: KFact[] };
export const KNOW_CHECKED = K.checked;
export const KNOW_SECTIONS = K.sections;
export const KNOW_FACTS = K.facts;
export const KNOW_HREF = "/know-before-you-go";
export const factsIn = (sec: string) => K.facts.filter((f) => f.sec === sec);

const STOP = new Set(["the", "a", "an", "in", "on", "to", "of", "is", "are", "do", "i", "you", "we", "can", "for", "and", "or", "what", "how", "my", "it", "cyprus", "need", "there", "with", "be", "at", "about"]);
/** Best matching facts for a question: keyword overlap with each fact's q words and text. */
export function searchFacts(query: string, max = 4): KFact[] {
  const words = norm(query).split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w));
  if (!words.length) return [];
  const scored = K.facts.map((f) => {
    const q = ` ${norm(f.q)} `, t = ` ${norm(f.t)} `;
    let s = 0;
    for (const w of words) {
      if (q.includes(` ${w} `)) s += 3; else if (q.includes(w)) s += 2;
      if (t.includes(` ${w} `)) s += 1;
    }
    return { f, s };
  }).filter((x) => x.s >= 2).sort((a, b) => b.s - a.s);
  return scored.slice(0, max).map((x) => x.f);
}
