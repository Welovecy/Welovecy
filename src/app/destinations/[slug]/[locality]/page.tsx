import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PROFILES, getDest, getLocality, getProfile, spots } from "@/lib/data";
import { byDistance } from "@/lib/around";
import { Crumbs } from "@/components/Bits";
import { NearRow } from "@/components/NearRow";
import { BusesNear } from "@/components/Buses";
import { LocalityChooser, resolveRef } from "@/components/Profile";
import { StayPanel } from "@/components/StayPanel";
import { directionsTo } from "@/lib/geo";
import type { AroundKind } from "@/lib/types";

type P = { params: Promise<{ slug: string; locality: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return Object.entries(PROFILES).flatMap(([slug, p]) => p.localities.map((l) => ({ slug, locality: l.slug })));
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug, locality } = await params;
  const l = getLocality(slug, locality), d = getDest(slug);
  return l && d ? { title: `${l.title}, ${d.name}`, description: l.bio, alternates: { canonical: `/destinations/${slug}/${locality}` } } : {};
}

export default async function LocalityPage({ params }: P) {
  const { slug, locality } = await params;
  const d = getDest(slug), profile = getProfile(slug), l = getLocality(slug, locality);
  if (!d || !profile || !l) notFound();
  const all = byDistance(l.centre, spots());
  const lead = l.refs.map(resolveRef).filter(Boolean).map((x) => x!.href);
  const within = (k: AroundKind, n: number) => all.filter((x) => x.s.k === k && x.d <= l.radius).slice(0, n);
  const nearest = (k: AroundKind, n: number) => all.filter((x) => x.s.k === k).slice(0, n);
  // lead places first, then other sights in the area
  const leadSights = all.filter((x) => lead.includes(x.s.href)).sort((a, b) => lead.indexOf(a.s.href) - lead.indexOf(b.s.href));
  const sights = [...leadSights, ...all.filter((x) => (x.s.k === "sight" || x.s.k === "family") && x.d <= l.radius * 1.5 && !lead.includes(x.s.href))].slice(0, 8);
  const beachesHere = within("beach", 6);
  const beaches = beachesHere.length ? beachesHere : nearest("beach", 4);
  const bars = within("night", 6), eat = within("eat", 8), stays = within("stay", 8);
  const Group = ({ id, title, list, more }: { id: string; title: string; list: typeof all; more?: React.ReactNode }) =>
    list.length ? (
      <section className="wrap" id={id} aria-labelledby={`h-${id}`}>
        <div className="sec-head"><h2 id={`h-${id}`}>{title}</h2>{more}</div>
        <ul className="rows">{list.map((x) => <NearRow key={x.s.key} n={x} noDistance={x.d <= l.radius} />)}</ul>
      </section>
    ) : null;
  return (
    <>
      <div className="wrap">
        <Crumbs items={[["Home", "/"], [d.name, `/destinations/${d.id}`], [l.title]]} />
        <div className="around-head">
          <p className="eyebrow">{l.nearby ? `Near ${d.name}` : d.name}</p>
          <h1>{l.title}</h1>
          <p className="lead" style={{ margin: 0 }}>{l.bio}</p>
          <div className="actions">
            <a className="btn btn-primary" href="#find-hotel">Find your hotel here</a>
            <a className="btn btn-ghost" href={directionsTo(l.centre)} target="_blank" rel="noopener noreferrer">Directions</a>
          </div>
        </div>
        <div style={{ marginTop: 16 }}><LocalityChooser d={d} profile={profile} current={l.slug} /></div>
      </div>
      <Group id="must" title="Must-see" list={sights} />
      <Group id="beaches" title={beachesHere.length ? "Beaches" : "Nearby beaches"} list={beaches} more={<Link href="/beaches">All beaches</Link>} />
      <Group id="bars" title="Bars nearby" list={bars} />
      <Group id="eat" title="Places to eat" list={eat} />
      <Group id="stay" title="Places to stay" list={stays} more={<Link href={`/stay/${d.id}`}>All in {d.name}</Link>} />
      <section className="wrap" id="find-hotel" style={{ paddingTop: 8 }}>
        <StayPanel dest={d.id} destName={d.name} />
      </section>
      <BusesNear ll={l.centre} title="Getting around" />
      <p className="wrap muted small" style={{ paddingBottom: 24 }}>Listings come from the official tourism registers and our map data. Check opening hours and bookings with each venue.</p>
    </>
  );
}
