import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/Bits";
import { Photo } from "@/components/Photo";
import { GUIDES, guideHref } from "@/lib/guides";
import { photoFor } from "@/lib/data";
import { MONTHS } from "@/lib/weather";
import { formatDate } from "@/lib/text";

export const metadata: Metadata = {
  title: "Cyprus travel guides",
  description: "Straight answers for your trip: airports and buses, the best beaches, what to do in each area and what the weather is like each month.",
};

export default function GuidesPage() {
  const order = ["Getting around", "Beaches", "Things to do", "Living in Cyprus"];
  const topics = [...new Set(GUIDES.map((g) => g.topic))].sort((a, b) => (order.indexOf(a) + 99 * +(order.indexOf(a) < 0)) - (order.indexOf(b) + 99 * +(order.indexOf(b) < 0)));
  return (
    <>
      <PageHead title="Guides" lead="Straight answers for your trip, checked against official sources." crumbs={[["Home", "/"], ["Guides"]]} />
      {topics.map((t) => (
        <section key={t} className="wrap" aria-labelledby={`h-${t}`}>
          <div className="sec-head"><h2 id={`h-${t}`}>{t}</h2></div>
          <div className="grid-3">
            {GUIDES.filter((g) => g.topic === t).map((g) => (
              <div className={`card${g.image ? "" : " g-textcard"}`} key={g.slug}>
                <Link href={guideHref(g.slug)} className="card-link">
                  {g.image ? <Photo photo={photoFor(g.image)} label={g.title} tint="#7E8EA0" ratio="16/10" /> : null}
                  <div>
                    <p className="eyebrow">{g.topic}</p>
                    <h3 className="mt4">{g.title}</h3>
                    <p className="mt6">{g.description}</p>
                    <p className="muted small mt6">Updated {formatDate(g.updated)} · {g.minutes} min read</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      ))}
      <section className="wrap" aria-labelledby="h-months">
        <div className="sec-head"><h2 id="h-months">Cyprus month by month</h2><Link href="/weather">Weather now</Link></div>
        <ul className="month-links">
          {MONTHS.map((m) => <li key={m}><Link href={`/weather/${m.toLowerCase()}`}>Cyprus in {m}</Link></li>)}
        </ul>
      </section>
    </>
  );
}
