import type { Metadata } from "next";
import Link from "next/link";
import { DESTINATIONS, photoFor } from "@/lib/data";
import { Photo } from "@/components/Photo";
import { ExploreTabs, ThisWeekend, Tiles } from "@/components/Explore";
import { FEATURE } from "@/lib/explore";
import { overlaps, upcoming, weekend } from "@/lib/events";
import { addDays, cyToday } from "@/lib/duty";

export const metadata: Metadata = {
  title: "Explore Cyprus",
  description: "Beaches, villages, family days and must-see places across the Republic of Cyprus, plus events and festivals coming up.",
  alternates: { canonical: "/explore" },
};
/** Rebuilt hourly so "This weekend" always means this weekend. */
export const revalidate = 3600;

export default function Explore() {
  const today = cyToday();
  const wk = weekend(today);
  const days = [wk[0], addDays(wk[0], 1), wk[1]];
  const thisWeekend = upcoming(today).filter((e) => overlaps(e, wk[0], wk[1]));
  return (
    <div className="wrap ex">
      <h1 className="ex-h1">Explore Cyprus</h1>
      <ExploreTabs on="places" />

      <Link href={FEATURE.href} className="ex-feature">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={FEATURE.img} alt={FEATURE.alt} fetchPriority="high" width={1600} height={900} />
        <span className="ex-feature-txt">
          <span className="ex-feature-eye">{FEATURE.eyebrow}</span>
          <b>{FEATURE.title}</b>
          <span className="ex-feature-cta">{FEATURE.cta} <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
        </span>
      </Link>

      <Tiles />
      <ThisWeekend events={thisWeekend} days={days} />

      <section className="ex-sec" aria-labelledby="h-dest">
        <div className="ex-sec-head"><h2 id="h-dest">Pick an area</h2><Link href="/destinations">All areas</Link></div>
        <div className="ex-dests">
          {DESTINATIONS.map((d) => (
            <Link key={d.id} href={`/destinations/${d.id}`} className="ex-dest">
              <Photo photo={photoFor(`dest-${d.id}`)} label={d.name} tint={d.tint} ratio="3/4" />
              <b>{d.name}</b>
              <span>{d.line}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
