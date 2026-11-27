"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { track } from "@vercel/analytics";
import { setBase, useBase } from "@/lib/store";
import { FB_GROUP } from "@/lib/site";
import type { LL } from "@/lib/types";

/**
 * Aphrodite, the AI guide. A calm orb button on every page, a glass sheet with answers from /api/ask,
 * and tappable cards for the places she names. The conversation lives in memory for this visit only.
 * Anything can open her with: window.dispatchEvent(new CustomEvent("aphrodite:open", { detail: { q } }))
 */
interface Card {
  k: "pharmacy" | "place" | "weather" | "bus" | "partner";
  n: string; sub?: string; meta?: string; href?: string; map?: string; tel?: string; img?: string;
  stay?: { id: string; n: string; ll: LL; href: string; around: string; area?: string };
  book?: string; pid?: string;
}
interface Msg { role: "user" | "assistant"; text: string; cards?: Card[]; follow?: string[]; fresh?: boolean }

/** The last conversation, kept on this device for a week so it can be reopened from a "Previous chat" line. */
const LAST = "wlc-aph-last";
const WEEK = 7 * 24 * 3600 * 1000;
interface Saved { at: number; msgs: Msg[] }
function loadLast(): Saved | null {
  try {
    const s = JSON.parse(localStorage.getItem(LAST) || "null") as Saved | null;
    if (!s || !Array.isArray(s.msgs) || !s.msgs.length || Date.now() - s.at > WEEK) return null;
    return s;
  } catch { return null; }
}
function saveLast(msgs: Msg[]) {
  try {
    if (!msgs.some((m) => m.role === "assistant")) return;
    localStorage.setItem(LAST, JSON.stringify({ at: Date.now(), msgs: msgs.slice(-20).map((m) => ({ ...m, fresh: false })) }));
  } catch {}
}
function forgetLast() { try { localStorage.removeItem(LAST); } catch {} }
function when(at: number) {
  const d = new Date(at), now = new Date();
  const t = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const days = Math.round((new Date(now.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 86400000);
  return days === 0 ? `Today ${t}` : days === 1 ? `Yesterday ${t}` : d.toLocaleDateString("en-GB", { weekday: "long" });
}

export const openAphrodite = (q?: string) => window.dispatchEvent(new CustomEvent("aphrodite:open", { detail: { q } }));

function greeting() {
  const h = Number(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", hour12: false, timeZone: "Asia/Nicosia" }));
  return h >= 5 && h < 12 ? "Kalimera!" : h >= 17 || h < 5 ? "Kalispera!" : "Yia sou!";
}

function starters(path: string, base: { n: string } | null): string[] {
  const h = Number(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", hour12: false, timeZone: "Asia/Nicosia" }));
  const out: string[] = [];
  if (/^\/(listing|places)\//.test(path)) out.push("What's around here?");
  if (base) out.push("Where can I eat near my hotel?", "Nearest beach to my hotel?");
  if (h >= 17 || h < 5) out.push("Which pharmacies are open tonight?", "Dinner with a view tonight?");
  else out.push("Is it warm enough to swim this week?", "Which pharmacies are open today?");
  out.push("Larnaca airport to Ayia Napa by bus?", "Quiet beaches away from the crowds?");
  return [...new Set(out)].slice(0, 4);
}

/* ---------- Text: links, bold, lists and phone numbers. Nothing else becomes markup. ---------- */
function inline(text: string, key: string, onNav: () => void): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*|(\+357[\d\s]{8,12}\d)/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${key}-${i++}`;
    if (m[1]) {
      let u: URL | null = null;
      try { u = new URL(m[2]); } catch {}
      const own = u && /(^|\.)welovecy\.com$/.test(u.hostname);
      out.push(own ? <Link key={k} href={u!.pathname + u!.search} onClick={onNav}>{m[1]}</Link> : <a key={k} href={m[2]} target="_blank" rel="noopener">{m[1]}</a>);
    } else if (m[3]) out.push(<strong key={k}>{m[3]}</strong>);
    else if (m[4]) out.push(<a key={k} href={`tel:${m[4].replace(/\s/g, "")}`}>{m[4]}</a>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
function Rich({ text, onNav }: { text: string; onNav: () => void }) {
  const blocks: ReactNode[] = [];
  let list: ReactNode[] = [];
  const flush = () => { if (list.length) { blocks.push(<ul key={`u${blocks.length}`}>{list}</ul>); list = []; } };
  text.split("\n").forEach((line, n) => {
    const li = /^\s*(?:[-*•]|\d+\.)\s+(.*)/.exec(line);
    if (li) { list.push(<li key={n}>{inline(li[1], `l${n}`, onNav)}</li>); return; }
    flush();
    if (line.trim()) blocks.push(<p key={n}>{inline(line.replace(/^#+\s*/, ""), `p${n}`, onNav)}</p>);
  });
  flush();
  return <>{blocks}</>;
}

/** Her words arrive a few at a time, like she's speaking. Respects reduced motion. */
function useReveal(text: string, on: boolean, done: () => void) {
  const [n, setN] = useState(on ? 0 : text.length);
  useEffect(() => {
    if (!on) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(text.length); done(); return; }
    let i = 0;
    const t = setInterval(() => {
      i = Math.min(text.length, text.indexOf(" ", i + 6) < 0 ? text.length : text.indexOf(" ", i + 6));
      setN(i);
      if (i >= text.length) { clearInterval(t); done(); }
    }, 28);
    return () => clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return text.slice(0, n);
}

const Icon = {
  call: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  map: <><path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" /><circle cx="12" cy="10" r="2.2" /></>,
  open: <path d="M9 6l6 6-6 6" />,
  home: <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1z" />,
  cross: <path d="M12 5v14M5 12h14" />,
  bus: <><rect x="5" y="4" width="14" height="13" rx="3" /><path d="M5 11h14M8 20v-3M16 20v-3" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></>,
};
const Svg = ({ d, s = 18 }: { d: ReactNode; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);

function CardView({ c, baseId, onNav }: { c: Card; baseId?: string; onNav: () => void }) {
  const [set, setSet] = useState(false);
  const badge = c.k === "pharmacy" ? Icon.cross : c.k === "bus" ? Icon.bus : c.k === "weather" ? Icon.sun : null;
  return (
    <article className={`aph-card aph-card-${c.k}`}>
      {c.img ? <div className="aph-card-img" style={{ backgroundImage: `url(${c.img})` }} role="img" aria-label={c.n} /> : null}
      <div className="aph-card-body">
        <div className="aph-card-top">
          {badge && <span className="aph-badge"><Svg d={badge} s={15} /></span>}
          <div style={{ minWidth: 0 }}>
            <h4>{c.n}</h4>
            {c.sub && <p>{c.sub}</p>}
          </div>
        </div>
        {c.meta && <span className={c.k === "partner" ? "aph-meta aph-ad" : "aph-meta"}>{c.meta}</span>}
        <div className="aph-acts">
          {c.tel && <a href={`tel:${c.tel.replace(/\s/g, "")}`} {...(c.k === "partner" ? { "data-ev": "Partner call", "data-ev-target": c.pid } : {})}><Svg d={Icon.call} s={16} />Call</a>}
          {c.map && <a href={c.map} target="_blank" rel="noopener"><Svg d={Icon.map} s={16} />Map</a>}
          {c.stay && c.stay.id !== baseId && (
            <button type="button" data-ev="Staying here" data-ev-target="aphrodite" onClick={() => { setBase(c.stay!); setSet(true); }}>
              <Svg d={Icon.home} s={16} />{set ? "Saved" : "My hotel"}
            </button>
          )}
          {c.k === "partner" && c.book && <a href={c.book} target="_blank" rel="noopener sponsored" data-ev="Partner book" data-ev-target={c.pid}>Book<Svg d={Icon.open} s={15} /></a>}
          {c.href && <Link href={c.href} onClick={onNav} {...(c.k === "partner" ? { "data-ev": "Partner page", "data-ev-target": c.pid } : {})}>{c.k === "partner" ? "Details" : "Open"}{c.k === "partner" ? null : <Svg d={Icon.open} s={15} />}</Link>}
        </div>
      </div>
    </article>
  );
}

function Answer({ m, baseId, onNav, onAsk, onDone }: { m: Msg; baseId?: string; onNav: () => void; onAsk: (q: string) => void; onDone: () => void }) {
  const [ready, setReady] = useState(!m.fresh);
  const shown = useReveal(m.text, !!m.fresh, () => { setReady(true); onDone(); });
  return (
    <div className="aph-turn">
      <div className="aph-msg assistant"><Rich text={shown} onNav={onNav} /></div>
      {ready && m.cards?.length ? <div className="aph-cards">{m.cards.map((c, i) => <CardView key={i} c={c} baseId={baseId} onNav={onNav} />)}</div> : null}
      {ready && m.follow?.length ? <div className="aph-follow">{m.follow.map((f) => <button key={f} onClick={() => onAsk(f)}>{f}</button>)}</div> : null}
    </div>
  );
}

export function Orb({ size = 28 }: { size?: number }) {
  // Aphrodite's face inside the glass ring. A fixed size, so nothing moves while it loads.
  return (
    <span className="aph-orb aph-face" style={{ width: size, height: size }} aria-hidden="true">
      <img src={size > 48 ? "/aphrodite-192.webp" : "/aphrodite-96.webp"} alt="" width={size} height={size} decoding="async" />
    </span>
  );
}

export function Ask() {
  const path = usePathname();
  const base = useBase();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [prev, setPrev] = useState<Saved | null>(null);
  const [calm, setCalm] = useState(false); // hidden while scrolling down, back on scroll up
  const [mini, setMini] = useState(false); // label shows briefly on each page, then she's just the orb
  useEffect(() => { setMini(false); const t = setTimeout(() => setMini(true), 4000); return () => clearTimeout(t); }, [path]);
  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const sheet = useRef<HTMLElement>(null);
  const pending = useRef<string | null>(null);

  // The homepage has its own Ask bar under the hero, so the orb waits until that has scrolled away.
  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      const home = path === "/" && y < 640;
      setCalm(home || (y > last + 4 && y > 200));
      if (Math.abs(y - last) > 4) last = y;
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [path]);

  const scrollDown = () => requestAnimationFrame(() => scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }));
  useEffect(() => { scrollDown(); }, [msgs.length, busy]);

  // Follow the visible viewport so the input sits right above the iPhone keyboard.
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    const fit = () => {
      const el = document.querySelector<HTMLElement>(".aph-wrap");
      if (!el || !vv) return;
      el.style.height = `${vv.height}px`;
      el.style.transform = `translateY(${vv.offsetTop}px)`;
    };
    fit();
    vv?.addEventListener("resize", fit); vv?.addEventListener("scroll", fit);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", esc);
    document.documentElement.classList.add("aph-open");
    return () => { vv?.removeEventListener("resize", fit); vv?.removeEventListener("scroll", fit); document.removeEventListener("keydown", esc); document.documentElement.classList.remove("aph-open"); };
  }, [open]);

  useEffect(() => {
    const on = (e: Event) => {
      const qq = (e as CustomEvent<{ q?: string }>).detail?.q;
      show();
      if (qq) pending.current = qq;
    };
    window.addEventListener("aphrodite:open", on);
    return () => window.removeEventListener("aphrodite:open", on);
  });
  useEffect(() => { if (open && pending.current) { const p = pending.current; pending.current = null; send(p); } });

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    const next: Msg[] = [...msgs.map((m) => ({ ...m, fresh: false })), { role: "user", text: t.slice(0, 500) }];
    setMsgs(next); setQ(""); setBusy(true);
    if (field.current) field.current.style.height = "auto";
    try {
      const r = await fetch("/api/ask", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, text }) => ({ role, text })), base: base ? { n: base.n, ll: base.ll, href: base.href } : null, page: path }),
      });
      const j = (await r.json().catch(() => ({}))) as { answer?: string; cards?: Card[]; follow?: string[] };
      const done: Msg[] = [...next, { role: "assistant", text: j.answer || "I couldn't answer just now. Please try again.", cards: j.cards, follow: j.follow, fresh: true }];
      setMsgs(done);
      saveLast(done);
    } catch {
      setMsgs([...next, { role: "assistant", text: "No connection right now. Check your signal and try again.", fresh: true }]);
    } finally { setBusy(false); }
  }

  function show() {
    // Each time she opens it's a fresh chat; the last one waits behind a "Previous chat" line.
    setMsgs([]);
    setPrev(loadLast());
    setOpen(true);
    try { track("Ask open", { page: path.slice(0, 100) }); } catch {}
    if (window.matchMedia("(min-width: 641px)").matches) setTimeout(() => field.current?.focus(), 300);
  }
  const close = () => { if (msgs.length) saveLast(msgs); setOpen(false); };
  const restore = () => {
    if (!prev) return;
    setMsgs(prev.msgs.map((m) => ({ ...m, fresh: false })));
    setPrev(null);
    try { track("Ask previous chat"); } catch {}
  };
  const dropPrev = () => { forgetLast(); setPrev(null); };

  // Swipe the sheet down to close it.
  const drag = useRef<{ y: number; dy: number } | null>(null);
  const onStart = (e: React.PointerEvent) => { drag.current = { y: e.clientY, dy: 0 }; };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || !sheet.current) return;
    drag.current.dy = Math.max(0, e.clientY - drag.current.y);
    sheet.current.style.transform = `translateY(${drag.current.dy}px)`;
  };
  const onEnd = () => {
    if (!drag.current || !sheet.current) return;
    const far = drag.current.dy > 110;
    sheet.current.style.transform = "";
    drag.current = null;
    if (far) close();
  };

  const lastFresh = msgs.length - 1;
  return (
    <>
      {!open && (
        <button className={`aph-fab${calm ? " is-calm" : ""}${mini ? " is-mini" : ""}`} onClick={show} aria-label="Ask Aphrodite, our AI guide">
          <Orb size={26} /><span className="aph-fab-l">Ask Aphrodite</span>
        </button>
      )}
      {open && (
        <div className="aph-wrap" onClick={(e) => e.target === e.currentTarget && close()}>
          <section ref={sheet} className="aph" role="dialog" aria-modal="true" aria-label="Aphrodite, your Cyprus guide">
            <header className="aph-head" onPointerDown={onStart} onPointerMove={onMove} onPointerUp={onEnd} onPointerCancel={onEnd}>
              <span className="aph-grab" aria-hidden="true" />
              <Orb size={38} />
              <div className="aph-who"><b>Aphrodite</b><small>{base ? `Your Cyprus guide · around ${base.n}` : "Your Cyprus guide · AI"}</small></div>
              <button className="aph-x" onClick={close} onPointerDown={(e) => e.stopPropagation()} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </header>
            <div className="aph-body" ref={scroller} aria-live="polite">
              {!msgs.length && (
                <div className="aph-hello">
                  {prev ? (
                    <div className="aph-prev">
                      <button type="button" className="aph-prev-open" onClick={restore}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 2" /></svg>
                        <span><span className="aph-prev-t"><b>Previous chat</b> · {when(prev.at)}</span><small>{prev.msgs.find((m) => m.role === "user")?.text}</small></span>
                      </button>
                      <button type="button" className="aph-prev-x" onClick={dropPrev} aria-label="Delete previous chat">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
                      </button>
                    </div>
                  ) : null}
                  <div className="aph-msg assistant"><p><strong>{greeting()}</strong> I&apos;m Aphrodite. Beaches, food, buses, late pharmacies, the weather: ask me anything about Cyprus.</p></div>
                  <div className="aph-follow aph-starters">
                    {starters(path, base).map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}
                  </div>
                </div>
              )}
              {msgs.map((m, i) => m.role === "user"
                ? <div key={i} className="aph-msg user">{m.text}</div>
                : <Answer key={i} m={m} baseId={base?.id} onNav={close} onAsk={send} onDone={i === lastFresh ? scrollDown : () => {}} />)}
              {busy && <div className="aph-msg assistant aph-dots" aria-label="Aphrodite is thinking"><i /><i /><i /></div>}
            </div>
            <form className="aph-form" onSubmit={(e) => { e.preventDefault(); send(q); }}>
              <textarea ref={field} rows={1} value={q} maxLength={500} placeholder="Ask Aphrodite" aria-label="Your question" enterKeyHint="send"
                onChange={(e) => { setQ(e.target.value); e.target.style.height = "auto"; e.target.style.height = `${Math.min(120, e.target.scrollHeight)}px`; }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(q); } }} />
              <button type="submit" disabled={!q.trim() || busy} aria-label="Send">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
              </button>
            </form>
            <p className="aph-note">AI guide, answers from welovecy.com. Check times with the venue. Emergency 112 · <a href={FB_GROUP} target="_blank" rel="noopener">Ask the group</a></p>
          </section>
        </div>
      )}
    </>
  );
}

/** The homepage bar under the hero: looks like a search field, opens Aphrodite. */
export function AskBar() {
  return (
    <button className="aph-bar" onClick={() => openAphrodite()} aria-label="Ask Aphrodite, our AI guide">
      <Orb size={30} />
      <span className="aph-bar-txt"><b>Ask Aphrodite</b><span>Beaches, food, buses, late pharmacies…</span></span>
      <span className="aph-bar-go" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg></span>
    </button>
  );
}
