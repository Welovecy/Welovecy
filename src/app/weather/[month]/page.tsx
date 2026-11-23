import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crumbs } from "@/components/Bits";
import { JsonLd } from "@/components/JsonLd";
import { DESTINATIONS } from "@/lib/data";
import { CLIMATE, CLIMATE_SOURCE, MONTHS } from "@/lib/weather";
import { MONTH_SLUGS, monthCopy, monthIndex } from "@/lib/months";

export const dynamicParams = false;
export function generateStaticParams() { return MONTH_SLUGS.map((month) => ({ month })); }

export async function generateMetadata({ params }: { params: Promise<{ month: string }> }): Promise<Metadata> {
  const m = monthIndex((await params).month);
  if (m < 0) return {};
  const c = monthCopy(m);
  return { title: `Cyprus in ${c.M}: weather, sea temperature and what to expect`, description: `Cyprus in ${c.M}: ${c.lead}`, alternates: { canonical: `/weather/${MONTH_SLUGS[m]}` } };
}

const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export default async function MonthPage({ params }: { params: Promise<{ month: string }> }) {
  const m = monthIndex((await params).month);
  if (m < 0) notFound();
  const c = monthCopy(m);
  const prev = (m + 11) % 12, next = (m + 1) % 12;
  const qa: [string, string][] = [
    [`Can you swim in Cyprus in ${c.M}?`, c.swim],
    [`How warm is Cyprus in ${c.M}?`, c.heat],
    [`Does it rain in Cyprus in ${c.M}?`, c.wet],
    [`What should I pack for Cyprus in ${c.M}?`, c.pack],
    [`What is Troodos like in ${c.M}?`, c.mountains],
  ];
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: qa.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }} />
      <div className="wrap hero">
        <Crumbs items={[["Home", "/"], ["Weather", "/weather"], [`Cyprus in ${c.M}`]]} />
        <h1 className="h-hero" style={{ marginTop: 16 }}>Cyprus in {c.M}</h1>
        <p className="lead">{c.lead}</p>
        <div className="chips" style={{ marginTop: 16 }}>{c.good.map((g) => <span key={g} className="chip on">{g}</span>)}</div>
      </div>
      <section className="wrap" aria-labelledby="h-areas">
        <div className="sec-head"><h2 id="h-areas">Area by area</h2><Link href="/weather">Weather right now</Link></div>
        <div className="g-table">
          <table>
            <thead><tr><th>Area</th><th>Day</th><th>Night</th><th>Sea</th><th>Rainy days</th><th>Sun a day</th></tr></thead>
            <tbody>
              {DESTINATIONS.map((d) => {
                const k = CLIMATE[d.id];
                return (
                  <tr key={d.id}>
                    <td><Link href={`/destinations/${d.id}#s-weather`}><strong>{d.name}</strong></Link><br /><span className="muted small">{c.verdict(d.id)}</span></td>
                    <td>{Math.round(k.hi[m])}°</td><td>{Math.round(k.lo[m])}°</td>
                    <td>{k.sea ? `${k.sea[m]}°` : "inland"}</td>
                    <td>{k.rain[m] < 0.5 ? "0" : Math.round(k.rain[m])}</td>
                    <td>{Math.round(k.sun[m] / DAYS[m])} h</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className="wrap" aria-label={`What ${c.M} is like`}>
        <div className="prose g-prose" style={{ maxWidth: 760 }}>
          {qa.map(([q, a]) => (<div key={q}><h2>{q}</h2><p>{a}</p></div>))}
        </div>
        <p className="muted small" style={{ marginTop: 28, maxWidth: 760 }}>
          Long-term averages: air temperature, rain and sunshine from the Cyprus Department of Meteorology; sea temperatures are approximate (weather2travel). Source: <a href={CLIMATE_SOURCE.u} target="_blank" rel="noopener noreferrer">Climate of Cyprus</a>, checked {CLIMATE_SOURCE.checked}. Any year can be warmer, cooler or wetter, so check the forecast before you go.
        </p>
      </section>
      <nav className="wrap month-nav" aria-label="Other months">
        <Link href={`/weather/${MONTH_SLUGS[prev]}`}>← Cyprus in {MONTHS[prev]}</Link>
        <Link href="/guides">All guides</Link>
        <Link href={`/weather/${MONTH_SLUGS[next]}`}>Cyprus in {MONTHS[next]} →</Link>
      </nav>
    </>
  );
}
