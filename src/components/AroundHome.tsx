"use client";
import Link from "next/link";
import { setBase, useBase } from "@/lib/store";
import type { LL } from "@/lib/types";
import { WhereSearch } from "./WhereSearch";
import { IslandMap } from "./IslandMap";
import { AppHead } from "./Bits";

export interface Town { id: string; n: string; ll: LL; img?: string }

/** Short names for the map labels. */
const SHORT: Record<string, string> = { ayianapa: "Ayia Napa", protaras: "Protaras", paphos: "Paphos", akamas: "Polis", limassol: "Limassol", larnaca: "Larnaca", nicosia: "Nicosia", troodos: "Troodos" };

export function AroundHome({ towns }: { towns: Town[] }) {
  const base = useBase();
  return (
    <div className="sheet-page">
      <AppHead title="Around you" crumbs={[["Home", "/"], ["Around you"]]} />
      <div className="wrap">
        <IslandMap label="Start from a town" pins={towns.filter((t) => t.id !== "protaras" && t.id !== "akamas").map((t) => ({ ll: t.ll, label: SHORT[t.id] ?? t.n, href: `/stay/${t.id}` }))} />
      </div>
      <section className="sheet" aria-labelledby="h-where">
        <div className="wrap sheet-in">
          <span className="grab" aria-hidden="true" />
          {base ? (
            <>
              <p className="app-sub">Where you&apos;re staying</p>
              <h2 id="h-where" className="sheet-h" style={{ marginTop: 0 }}>{base.n}</h2>
              <div className="sheet-acts">
                <Link className="btn btn-primary" href={base.around}>See what&apos;s around</Link>
                <Link className="btn btn-ghost" href={base.href}>Details</Link>
                <button className="btn btn-ghost" type="button" onClick={() => setBase(null)}>Change</button>
              </div>
            </>
          ) : (
            <>
              <h2 id="h-where" className="sheet-h" style={{ marginTop: 0 }}>Where are you staying?</h2>
              <WhereSearch scope="stay" placeholder="Your hotel or apartment" label="Find your hotel" hint="Beaches, food, pharmacies and buses closest to it, with walking times. Still choosing? It works the same way." />
            </>
          )}
          <h3 className="sheet-h3">Or start from a town</h3>
          <div className="town-rail">
            {towns.map((t) => (
              <Link key={t.id} href={`/stay/${t.id}`} className="town">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {t.img ? <img src={t.img} alt="" loading="lazy" decoding="async" /> : null}
                <span>{t.n}</span>
              </Link>
            ))}
          </div>
          <p className="hint">Visiting a beach or sight? Open it and tap Around.</p>
        </div>
      </section>
    </div>
  );
}
