import { ogMeta } from "@/lib/og";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/Bits";
import { KNOW_CHECKED, factsIn } from "@/lib/knowledge";
import { formatDate } from "@/lib/text";

export const metadata: Metadata = { openGraph: ogMeta("/living-in-cyprus"),
  title: "Living in Cyprus",
  description: "Moving to Cyprus: the yellow slip and residence permits, registering with GESY, swapping your driving licence, electricity bills and public schools. Every fact with its official source.",
  alternates: { canonical: "/living-in-cyprus" },
};

const TOPICS: [string, string][] = [["residence", "Residence"], ["health", "Healthcare (GESY)"], ["driving", "Driving licence"], ["bills", "Bills"], ["schools", "Schools"]];

export default function LivingInCyprus() {
  const facts = factsIn("living");
  return (
    <>
      <PageHead title="Living in Cyprus" lead="The paperwork that matters when you move here, from the departments that run it." crumbs={[["Home", "/"], ["Practical info", "/practical"], ["Living in Cyprus"]]}>
        <nav className="chips" aria-label="On this page" style={{ marginTop: 12 }}>
          {TOPICS.map(([id, t]) => <a key={id} className="chip" href={`#${id}`}>{t}</a>)}
        </nav>
      </PageHead>
      {TOPICS.map(([id, title]) => {
        const list = facts.filter((f) => f.topic === id);
        if (!list.length) return null;
        return (
          <section key={id} className="wrap pad-top" id={id} aria-labelledby={`h-${id}`}>
            <h2 id={`h-${id}`} className="h-sub">{title}</h2>
            <div className="know-list">
              {list.map((f) => (
                <div key={f.id} id={f.id} className="know-fact">
                  <p>{f.t}</p>
                  <p className="tag">{f.src.map((x, i) => <span key={x.u}>{i ? " · " : "Source: "}<a href={x.u} target="_blank" rel="noopener noreferrer">{x.t}</a></span>)}</p>
                </div>
              ))}
            </div>
          </section>
        );
      })}
      <section className="wrap">
        <p className="tag">Rules and fees change. Always check with the department before you apply. Visiting rather than moving? See <Link href="/know-before-you-go">Know before you go</Link>.</p>
        <p className="tag">Last checked: {formatDate(KNOW_CHECKED)}</p>
      </section>
    </>
  );
}
