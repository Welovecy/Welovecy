"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import bank from "@data/quiz.json";

export interface QItem { id: string; q: string; o: string[]; a: number; why: string; href: string; link: string }
const BANK = bank as QItem[];
const ROUND = 10;
const SITE = "https://www.welovecy.com";

function shuffle<T>(xs: T[]): T[] {
  const a = xs.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
/** Options in a fresh order, remembering which one is right. */
function deal(q: QItem) { const order = shuffle(q.o.map((_, i) => i)); return { ...q, o: order.map((i) => q.o[i]), a: order.indexOf(q.a) }; }

export const LEVELS: [number, string, string][] = [
  [0, "Fresh off the plane", "Everyone starts somewhere. Have a look around the site and try again."],
  [4, "Happy holidaymaker", "You know your halloumi from your kleftiko. Not bad at all."],
  [7, "Almost local", "You've clearly spent some proper time on the island."],
  [9, "Honorary Cypriot", "Kalimera! You know Cyprus like someone who lives here."],
];
const levelFor = (s: number) => [...LEVELS].reverse().find(([min]) => s >= min)!;

function read(k: string) { try { return localStorage.getItem(k); } catch { return null; } }
function write(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* private mode */ } }

export function Quiz() {
  const [qs, setQs] = useState<QItem[] | null>(null);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [best, setBest] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const start = useCallback(() => { setQs(shuffle(BANK).slice(0, ROUND).map(deal)); setI(0); setPick(null); setAnswers([]); setCopied(false); }, []);
  useEffect(() => { start(); const b = read("wlc-quiz-best"); if (b) setBest(+b); }, [start]);

  const done = qs && answers.length === qs.length && pick === null;
  const score = answers.filter(Boolean).length;
  useEffect(() => {
    if (!done) return;
    if (best === null || score > best) { setBest(score); write("wlc-quiz-best", String(score)); }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!qs) return <div className="quiz quiz-wait" aria-hidden="true" />;

  if (done) {
    const [, title, line] = levelFor(score);
    const text = `I scored ${score}/${qs.length} on "How well do you know Cyprus?" I'm ${title.toLowerCase().startsWith("honorary") ? "an" : "a"} ${title}. Can you beat it?`;
    const url = `${SITE}/quiz`;
    const share = async () => {
      if (navigator.share) { try { await navigator.share({ title: "How well do you know Cyprus?", text, url }); return; } catch { /* closed */ } }
      try { await navigator.clipboard.writeText(`${text} ${url}`); setCopied(true); } catch { setCopied(false); }
    };
    return (
      <div className="quiz">
        <div className="quiz-result">
          <p className="eyebrow">Your score</p>
          <div className="quiz-score"><b>{score}</b>/{qs.length}</div>
          <h2 className="quiz-title">{title}</h2>
          <p className="lead">{line}</p>
          {best !== null ? <p className="muted small">Your best: {best}/{qs.length}</p> : null}
          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={share}>{copied ? "Copied, paste it anywhere" : "Share your score"}</button>
            <a className="btn btn-ghost" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">Post to Facebook</a>
            <button type="button" className="btn btn-ghost" onClick={start}>Play again</button>
          </div>
        </div>
        <h3 className="h-sub" style={{ marginTop: 40 }}>The answers</h3>
        <ol className="quiz-review">
          {qs.map((q, n) => (
            <li key={q.id} className={answers[n] ? "ok" : "no"}>
              <span className="quiz-mark" aria-label={answers[n] ? "Right" : "Wrong"}>{answers[n] ? "✓" : "✗"}</span>
              <div><strong>{q.q}</strong><p>{q.o[q.a]}. {q.why}</p><Link href={q.href}>{q.link}</Link></div>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  const q = qs[i];
  const answered = pick !== null;
  const right = answered && pick === q.a;
  const next = () => { setAnswers((a) => [...a, pick === q.a]); setPick(null); setI((n) => Math.min(n + 1, qs.length - 1)); };
  return (
    <div className="quiz">
      <div className="quiz-top">
        <span className="muted">Question {i + 1} of {qs.length}</span>
        <span className="quiz-dots" aria-hidden="true">{qs.map((_, n) => <i key={n} className={n < answers.length ? (answers[n] ? "ok" : "no") : n === i ? "cur" : ""} />)}</span>
      </div>
      <h2 className="quiz-q">{q.q}</h2>
      <div className="quiz-opts" role="group" aria-label="Answers">
        {q.o.map((o, n) => (
          <button key={n} type="button" disabled={answered}
            className={`quiz-opt${answered && n === q.a ? " right" : ""}${answered && n === pick && n !== q.a ? " wrong" : ""}`}
            onClick={() => setPick(n)}>{o}</button>
        ))}
      </div>
      {answered ? (
        <div className={`quiz-why ${right ? "ok" : "no"}`} aria-live="polite">
          <strong>{right ? "Spot on." : "Not quite."}</strong> {q.why}
          <div className="actions"><button type="button" className="btn btn-primary" onClick={next} autoFocus>{answers.length + 1 === qs.length ? "See your score" : "Next question"}</button></div>
        </div>
      ) : null}
    </div>
  );
}

/** One question a day on the home page, the same for everyone that day. */
export function QuestionOfTheDay() {
  const [q, setQ] = useState<QItem | null>(null);
  const [pick, setPick] = useState<number | null>(null);
  useEffect(() => {
    const day = Math.floor((Date.now() + 2 * 36e5) / 864e5);
    const base = BANK[day % BANK.length];
    // a stable option order for the day
    const order = base.o.map((_, i) => i).sort((a, b) => ((a * 7 + day) % 4) - ((b * 7 + day) % 4));
    setQ({ ...base, o: order.map((i) => base.o[i]), a: order.indexOf(base.a) });
  }, []);
  const ready = useMemo(() => !!q, [q]);
  if (!ready || !q) return <div className="qotd quiz-wait" aria-hidden="true" />;
  return (
    <div className="qotd">
      <p className="eyebrow">Question of the day</p>
      <h3 className="quiz-q">{q.q}</h3>
      <div className="quiz-opts" role="group" aria-label="Answers">
        {q.o.map((o, n) => (
          <button key={n} type="button" disabled={pick !== null}
            className={`quiz-opt${pick !== null && n === q.a ? " right" : ""}${pick === n && n !== q.a ? " wrong" : ""}`}
            onClick={() => setPick(n)}>{o}</button>
        ))}
      </div>
      {pick !== null ? <p className="quiz-why-inline"><strong>{pick === q.a ? "Spot on." : "Not quite."}</strong> {q.why}</p> : null}
      <Link className="btn btn-ghost" href="/quiz">Take the full quiz</Link>
    </div>
  );
}
