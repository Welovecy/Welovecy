"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { WhereSearch, SearchIcon, RECENT, type Recent } from "./WhereSearch";
import { KindIcon } from "./KindIcon";
import { openAphrodite } from "./Ask";
import type { AroundKind } from "@/lib/types";

const NEARBY: [AroundKind, string, string][] = [
  ["beach", "Beaches", "/beaches"], ["eat", "Eat & drink", "/eat-drink"], ["sight", "Must-see", "/must-see"], ["pharmacy", "Pharmacies", "/pharmacies-on-duty"],
  ["market", "Shops", "/essentials"], ["bus", "Buses", "/buses"], ["fuel", "Petrol", "/petrol"], ["stay", "Hotels", "/stay"],
];
const ASK = ["Quiet beach near Protaras", "Pharmacy open tonight", "Plan a rainy day"];

export function SearchHome() {
  const [recent, setRecent] = useState<Recent[]>([]);
  useEffect(() => { try { setRecent(JSON.parse(localStorage.getItem(RECENT) || "[]")); } catch {} }, []);
  const clear = () => { try { localStorage.removeItem(RECENT); } catch {} setRecent([]); };
  const idle = (
    <div className="shome">
      <section aria-labelledby="h-nearby">
        <h2 id="h-nearby" className="sheet-h">Find nearby</h2>
        <div className="nearby-grid">
          {NEARBY.map(([k, label, href]) => (
            <Link key={href} href={href} className="nearby"><KindIcon k={k} size={54} /><span>{label}</span></Link>
          ))}
        </div>
      </section>
      <section className="ask-card" aria-labelledby="h-ask">
        <p id="h-ask" className="ask-card-h">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/aphrodite-96.webp" alt="" width={30} height={30} />
          Or just ask Aphrodite
        </p>
        <div className="chips">
          {ASK.map((q) => <button key={q} type="button" className="chip" onClick={() => openAphrodite(q)}>{q}</button>)}
        </div>
      </section>
      {recent.length ? (
        <section aria-labelledby="h-recent">
          <div className="dsec-row"><h2 id="h-recent" className="sheet-h">Recent</h2><button type="button" className="linkbtn" onClick={clear}>Clear</button></div>
          <ul className="rows rows-flat">
            {recent.map((r) => (
              <li key={r.h}><Link className="row" href={r.h}><SearchIcon t={r.t} /><span className="rowtxt"><strong>{r.n}</strong><span>{r.s}</span></span></Link></li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
  return <WhereSearch autoFocus placeholder="Beaches, places, hotels" label="Search places, beaches, hotels, restaurants and bars" hint="Understands local spellings: Larnaka, Lefkosia, Lemesos, Pafos, Agia Napa." idle={idle} />;
}
