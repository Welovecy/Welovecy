import { ogMeta } from "@/lib/og";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHead, Sources } from "@/components/Bits";
import { KNOW_CHECKED, factsIn } from "@/lib/knowledge";

export const metadata: Metadata = { openGraph: ogMeta("/cyprus-history"),
  title: "Cyprus history in 15 minutes",
  description: "11,000 years of Cyprus history, from the first settlers at Choirokoitia to the EU, with a place you can see each period today.",
  alternates: { canonical: "/cyprus-history" },
};

export default function CyprusHistory() {
  const rows = factsIn("history");
  const src = rows[0]?.src[0];
  return (
    <>
      <PageHead title="Cyprus history in 15 minutes" lead="11,000 years on one page. Every period comes with a place on the island where you can still see it." crumbs={[["Home", "/"], ["Practical info", "/practical"], ["Cyprus history"]]} />
      <section className="wrap pad-top" aria-label="Timeline">
        <ol className="history">
          {rows.map((r) => (
            <li key={r.id} id={r.id} className="history-step">
              <p className="history-when">{r.dates}</p>
              <h2 className="history-title">{r.period}</h2>
              <p>{r.what}</p>
              {r.see ? <p className="tag">See it at: {r.see}</p> : null}
            </li>
          ))}
        </ol>
        <p className="small" style={{ marginTop: 20 }}>
          Go and see it: <Link href="/unesco">UNESCO sites in Cyprus</Link> · <Link href="/guides/troodos-painted-churches-route">The painted churches route</Link> · <Link href="/must-see">Must-see places</Link>
        </p>
        {src ? <Sources list={[src]} reviewed={KNOW_CHECKED} /> : null}
      </section>
    </>
  );
}
