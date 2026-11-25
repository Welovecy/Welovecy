"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { track } from "@vercel/analytics";
import { useBase } from "@/lib/store";
import { FB_GROUP } from "@/lib/site";

/**
 * "Ask" button and chat sheet. Answers come from /api/ask, which uses our own data.
 * The conversation lives in memory only and is gone when the page closes.
 */
interface Msg { role: "user" | "assistant"; text: string }

const STARTERS = [
  "Which pharmacies are open tonight?",
  "What's the nearest beach to my hotel?",
  "Larnaca airport to Ayia Napa by bus?",
  "Is it warm enough to swim this week?",
];

/** Links, bold, lists and phone numbers. Nothing else from the answer becomes markup. */
function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*|(\+357[\d\s]{8,12}\d)/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${key}-${i++}`;
    if (m[1]) {
      const u = new URL(m[2]);
      const own = /(^|\.)welovecy\.com$/.test(u.hostname);
      out.push(<a key={k} href={own ? u.pathname + u.search : m[2]} {...(own ? {} : { target: "_blank", rel: "noopener" })}>{m[1]}</a>);
    } else if (m[3]) out.push(<strong key={k}>{m[3]}</strong>);
    else if (m[4]) out.push(<a key={k} href={`tel:${m[4].replace(/\s/g, "")}`}>{m[4]}</a>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
function Rich({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: ReactNode[] = [];
  const flush = () => { if (list.length) { blocks.push(<ul key={`u${blocks.length}`}>{list}</ul>); list = []; } };
  text.split("\n").forEach((line, n) => {
    const li = /^\s*(?:[-*•]|\d+\.)\s+(.*)/.exec(line);
    if (li) { list.push(<li key={n}>{inline(li[1], `l${n}`)}</li>); return; }
    flush();
    if (line.trim()) blocks.push(<p key={n}>{inline(line.replace(/^#+\s*/, ""), `p${n}`)}</p>);
  });
  flush();
  return <>{blocks}</>;
}

export function Ask() {
  const path = usePathname();
  const base = useBase();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  // On the homepage the button waits until the hero shortcuts have scrolled away, so it never covers them
  const [past, setPast] = useState(false);
  useEffect(() => {
    if (path !== "/") return;
    const on = () => setPast(window.scrollY > 520);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [path]);
  const fab = path !== "/" || past;
  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }); }, [msgs, busy]);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    document.documentElement.classList.add("ask-open");
    return () => { document.removeEventListener("keydown", esc); document.documentElement.classList.remove("ask-open"); };
  }, [open]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    const next = [...msgs, { role: "user" as const, text: t.slice(0, 500) }];
    setMsgs(next); setQ(""); setBusy(true);
    try {
      const r = await fetch("/api/ask", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next, base: base ? { n: base.n, ll: base.ll, href: base.href } : null, page: path }),
      });
      const j = (await r.json().catch(() => ({}))) as { answer?: string };
      setMsgs([...next, { role: "assistant", text: j.answer || "I couldn't answer just now. Please try again." }]);
    } catch {
      setMsgs([...next, { role: "assistant", text: "No connection right now. Check your signal and try again." }]);
    } finally { setBusy(false); }
  }

  const show = () => { setOpen(true); try { track("Ask open", { page: path.slice(0, 100) }); } catch {} setTimeout(() => field.current?.focus(), 250); };

  return (
    <>
      {!open && (
        <button className={`ask-fab${fab ? "" : " ask-fab-off"}`} onClick={show} aria-label="Ask a question about Cyprus">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5A8 8 0 1 1 21 12z" /></svg>
          <span>Ask</span>
        </button>
      )}
      {open && (
        <div className="ask-wrap" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <section className="ask" role="dialog" aria-modal="true" aria-label="Ask We Love Cyprus">
            <header className="ask-head">
              <div><b>Ask We Love Cyprus</b><small>{base ? `Answers around ${base.n}` : "Beaches, food, buses, pharmacies and more"}</small></div>
              <button className="ask-x" onClick={() => setOpen(false)} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </header>
            <div className="ask-body" ref={scroller}>
              {!msgs.length && (
                <div className="ask-hello">
                  <p>Hi! Ask me anything about getting around Cyprus. I answer from the guide, with links to the full page.</p>
                  <div className="ask-starters">
                    {STARTERS.map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}
                  </div>
                </div>
              )}
              {msgs.map((m, i) => (
                <div key={i} className={`ask-msg ${m.role}`}>{m.role === "assistant" ? <Rich text={m.text} /> : m.text}</div>
              ))}
              {busy && <div className="ask-msg assistant ask-dots" aria-label="Thinking"><i /><i /><i /></div>}
            </div>
            <form className="ask-form" onSubmit={(e) => { e.preventDefault(); send(q); }}>
              <textarea ref={field} rows={1} value={q} maxLength={500} placeholder="Type your question" aria-label="Your question"
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(q); } }} />
              <button type="submit" disabled={!q.trim() || busy} aria-label="Send">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </form>
            <p className="ask-note">AI answers from our guide. Check times with the venue. Emergency: 112. Prefer people? <a href={FB_GROUP} target="_blank" rel="noopener">Ask the group</a></p>
          </section>
        </div>
      )}
    </>
  );
}
