import { ogMeta } from "@/lib/og";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/Bits";
import { formatDate } from "@/lib/text";
import { KNOW_CHECKED, KNOW_SECTIONS, factsIn } from "@/lib/knowledge";

export const metadata: Metadata = { openGraph: ogMeta("/know-before-you-go"),
  title: "Know before you go",
  description: "Passports, health cards, heat, lifeguards, drones, e-scooters, shop hours, roaming and the best time to visit the Republic of Cyprus. Every fact with its source.",
  alternates: { canonical: "/know-before-you-go" },
};

export default function KnowBeforeYouGo() {
  return (
    <>
      <PageHead title="Know before you go" lead="The rules and facts worth knowing before you land. Each one comes with its source." crumbs={[["Home", "/"], ["Practical info", "/practical"], ["Know before you go"]]}>
        <nav className="chips" aria-label="On this page" style={{ marginTop: 12 }}>
          {KNOW_SECTIONS.map((s) => <a key={s.id} className="chip" href={s.own ?? `#${s.id}`}>{s.title}</a>)}
        </nav>
      </PageHead>
      {KNOW_SECTIONS.map((s) => {
        const facts = factsIn(s.id);
        if (!facts.length || s.own) return null;
        return (
          <section key={s.id} className="wrap pad-top know" id={s.id} aria-labelledby={`h-${s.id}`}>
            <h2 id={`h-${s.id}`} className="h-sub">{s.title}</h2>
            <p className="lead small" style={{ marginTop: 0 }}>{s.lead}</p>
            <div className="know-list">
              {facts.map((f) => (
                <div key={f.id} id={f.id} className="know-fact">
                  <p>{f.t}</p>
                  <p className="tag">
                    {f.src.map((x, i) => (
                      <span key={x.u}>{i ? " · " : "Source: "}<a href={x.u} target="_blank" rel="noopener noreferrer">{x.t}</a></span>
                    ))}
                  </p>
                </div>
              ))}
            </div>
            {s.id === "health" ? <p className="small"><Link href="/practical#emergency">All emergency and help numbers</Link> · <Link href="/pharmacies-on-duty">Pharmacies on duty tonight</Link></p> : null}
            {s.id === "when" ? <p className="small"><Link href="/weather">Weather and sea temperature month by month</Link></p> : null}
          </section>
        );
      })}
      <section className="wrap">
        <p className="tag">Our guide covers the Republic of Cyprus. Rules change, so for entry rules always check your own government&apos;s travel advice before you go.</p>
        <p className="tag">Last checked: {formatDate(KNOW_CHECKED)}</p>
      </section>
    </>
  );
}
