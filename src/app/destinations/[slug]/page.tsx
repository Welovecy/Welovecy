import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DESTINATIONS, EXPERIENCES, MAKERS, PLACES_BY_DEST, getDest, getPlace, photoFor } from "@/lib/data";
import { DestCard, ExperienceCard, FeaturedBlock, MakerCard, PlaceCard } from "@/components/Cards";
import { Crumbs, Facts, Sources } from "@/components/Bits";
import { Photo } from "@/components/Photo";
import { SaveButton } from "@/components/SaveButton";
import { ListingSection } from "@/components/Listing";
import { StayPanel } from "@/components/StayPanel";
import { ListRow } from "@/components/ListRow";
import { bizRow, staysBySea, staysIn } from "@/lib/views";
import { getProfile } from "@/lib/data";
import { LocalityChooser, PlanVisit, StartHere } from "@/components/Profile";
import { AirportLine } from "@/components/AirportLine";
import { WeatherNow } from "@/components/Weather";
import { ClimateChart } from "@/components/ClimateChart";
import { fmtD } from "@/lib/geo";
import type { Fact } from "@/lib/types";

export const dynamicParams = false;
export function generateStaticParams() { return DESTINATIONS.map((d) => ({ slug: d.id })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const d = getDest((await params).slug);
  return d ? { title: d.name, description: d.line, alternates: { canonical: `/destinations/${d.id}` } } : {};
}

const TAXI_ROW: Fact = ["Taxis", "Urban taxis use the meter. Day tariff from €3.80 plus €0.95 per km.", false];

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const d = getDest((await params).slug);
  if (!d) notFound();
  const href = `/destinations/${d.id}`;
  const bySea = staysBySea(d.id, 6);
  const exps = EXPERIENCES.filter((e) => e.dest === d.id);
  const makers = MAKERS.filter((m) => m.dest === d.id);
  const stayCount = staysIn(d.id).length;

  const stay = (
    <section className="wrap" id="s-stay" aria-labelledby="h-stay">
      <div className="sec-head"><h2 id="h-stay">Stay</h2><Link href={`/stay/${d.id}`}>All {stayCount} places to stay</Link></div>
      <div className="split">
        <div className="near-group">
          {bySea.length ? (
            <>
              <h3 style={{ fontSize: 20 }}>Closest to the sea</h3>
              <ul className="rows">{bySea.map((o) => <ListRow key={o.b.i} {...bizRow(o.b, o.beach ? `${fmtD(o.d)} to ${o.beach.n}` : undefined)} save />)}</ul>
            </>
          ) : (
            <>
              <h3 style={{ fontSize: 20 }}>Licensed hotels and apartments</h3>
              <ul className="rows">{staysIn(d.id).slice(0, 8).map((b) => <ListRow key={b.i} {...bizRow(b)} save />)}</ul>
              <p className="tag">Exact locations for {d.name} are being added, so distances aren&apos;t shown yet.</p>
            </>
          )}
        </div>
        <StayPanel dest={d.id} destName={d.name} />
      </div>
    </section>
  );

  if (!d.live) {
    return (
      <>
        <div className="wrap hero">
          <Crumbs items={[["Home", "/"], ["Destinations", "/destinations"], [d.name]]} />
          <div style={{ height: 16 }} />
          <Photo photo={photoFor(`dest-${d.id}`)} label={d.name} tint={d.tint} ratio="16/9" priority hero className="hero-photo" />
          <div className="hero-copy"><h1 className="h-hero">{d.name}</h1><p className="lead">{d.line}</p></div>
        </div>
        <ListingSection dest={d.id} kind="sight" title="Must-see" id="s-must" />
        <ListingSection dest={d.id} kind="beach" title="Beaches" id="s-beach" />
        {stay}
        {PLACES_BY_DEST(d.id).length >= 5 ? null : <section className="wrap">
          <div className="empty">
            <h2 style={{ fontSize: 24 }}>Sights and stories for this area are being written.</h2>
            <p className="muted">Ayia Napa, Protaras, Paphos and Larnaca are ready to explore in full.</p>
            <Link className="btn btn-primary" href="/destinations/ayianapa">Explore Ayia Napa</Link>
          </div>
        </section>}
      </>
    );
  }

  const profile = getProfile(d.id);
  if (profile) {
    const operator = d.id === "paphos" ? { t: "Pafos Buses", u: "https://www.pafosbuses.com/" } : { t: "OSEA", u: "https://www.osea.com.cy/" };
    return (
      <>
        <div className="wrap hero">
          <Crumbs items={[["Home", "/"], ["Destinations", "/destinations"], [d.name]]} />
          <div style={{ height: 16 }} />
          <Photo photo={photoFor(`dest-${d.id}`)} label={d.hero || d.name} tint={d.tint} ratio="16/9" priority hero className="hero-photo" />
          <div className="hero-copy">
            <h1 className="h-hero">{d.name}</h1>
            <p className="lead">{profile.intro}</p>
            <div className="actions">
              <a className="btn btn-primary" href="#s-stay">Explore around your hotel</a>
              <SaveButton item={{ key: href, n: d.name, href, sub: "Destination" }} />
            </div>
            <LocalityChooser d={d} profile={profile} />
            <a href="#s-weather" className="wx-link"><WeatherNow d={d.id} name={d.name} compact /></a>
          </div>
        </div>
        <div className="subnav">
          <nav className="wrap" aria-label="On this page">
            {[["s-start", "Start here"], ["s-must", "Sights"], ["s-beach", "Beaches"], ["s-eat", "Eat & drink"], ["s-stay", "Stay"], ["s-weather", "Weather"], ["s-plan", "Plan"]].map(([id, l]) => (
              <a key={id} href={`#${id}`}>{l}</a>
            ))}
          </nav>
        </div>
        <section className="wrap" id="s-start" aria-labelledby="h-start">
          <div className="sec-head"><h2 id="h-start">Start here</h2></div>
          <StartHere items={profile.start} />
        </section>
        <ListingSection dest={d.id} kind="sight" title="Sights" id="s-must" limit={8} viewAll={`/must-see#ms-${d.id}`} />
        <ListingSection dest={d.id} kind="beach" title="Beaches" id="s-beach" limit={8} viewAll="/beaches" />
        <section className="wrap" id="s-eat" aria-labelledby="h-eat">
          <div className="sec-head"><h2 id="h-eat">Eat &amp; drink</h2></div>
          <p style={{ maxWidth: 720 }}>{profile.food}</p>
          <div className="chips" style={{ marginTop: 12 }}>
            {profile.localities.map((l) => <Link key={l.slug} className="chip stay-chip" href={`/destinations/${d.id}/${l.slug}#eat`}>{l.title}</Link>)}
          </div>
        </section>
        {exps.length || makers.length ? (
          <section className="wrap" aria-labelledby="h-makers">
            <div className="sec-head"><h2 id="h-makers">Makers and local stories</h2></div>
            <div className="grid-3">{exps.map((e) => <ExperienceCard key={e.slug} e={e} />)}{makers.map((m) => <MakerCard key={m.slug} m={m} />)}</div>
          </section>
        ) : null}
        {stay}
        <FeaturedBlock destName={d.name} />
        <AirportLine d={d.id} name={d.name} />
        <section className="wrap" id="s-weather" aria-labelledby="h-weather">
          <div className="sec-head"><h2 id="h-weather">Weather</h2><Link href="/weather">Every area, every month</Link></div>
          <WeatherNow d={d.id} name={d.name} />
          <h3 className="h-sub" style={{ marginTop: 40 }}>Month by month</h3>
          <ClimateChart d={d.id} name={d.name} />
        </section>
        <PlanVisit d={d} profile={profile} operator={operator} />
        {d.next?.length ? (
          <section className="wrap" aria-labelledby="h-next">
            <div className="sec-head"><h2 id="h-next">Continue exploring</h2></div>
            <div className="grid">{d.next.map((n) => { const x = getDest(n); return x ? <DestCard key={n} d={x} /> : null; })}</div>
          </section>
        ) : null}
      </>
    );
  }

  return (
    <>
      <div className="wrap hero">
        <Crumbs items={[["Home", "/"], ["Destinations", "/destinations"], [d.name]]} />
        <div style={{ height: 16 }} />
        <Photo photo={photoFor(`dest-${d.id}`)} label={d.hero || d.name} tint={d.tint} ratio="16/9" priority hero className="hero-photo" />
        <div className="hero-copy">
          <h1 className="h-hero">{d.name}</h1>
          <p className="lead">{d.line}</p>
          <div className="actions"><SaveButton item={{ key: href, n: d.name, href, sub: "Destination" }} /></div>
          <a href="#s-weather" className="wx-link"><WeatherNow d={d.id} name={d.name} compact /></a>
        </div>
      </div>
      <div className="subnav">
        <nav className="wrap" aria-label="On this page">
          {[["s-overview", "Overview"], ["s-must", "Must-see"], ["s-beach", "Beaches"], ["s-stay", "Stay"], ["featured", "Featured"], ["s-weather", "Weather"], ["s-plan", "Plan"]].map(([id, l]) => (
            <a key={id} href={`#${id}`}>{l}</a>
          ))}
        </nav>
      </div>
      <section className="wrap" id="s-overview" aria-labelledby="h-glance">
        <h2 id="h-glance" className="h-sub">At a glance</h2>
        <dl className="glance">{(d.glance || []).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        {d.start?.length ? (
          <>
            <h2 className="h-sub" style={{ marginTop: 48 }}>Start here</h2>
            <div className="grid-3">{d.start.map((s) => { const p = getPlace(s); return p ? <PlaceCard key={s} p={p} /> : null; })}</div>
          </>
        ) : null}
      </section>
      <ListingSection dest={d.id} kind="sight" title="Must-see" id="s-must" />
      <ListingSection dest={d.id} kind="beach" title="Beaches" id="s-beach" />
      {exps.length || makers.length ? (
        <section className="wrap" aria-labelledby="h-makers">
          <div className="sec-head"><h2 id="h-makers">Makers and local stories</h2></div>
          <div className="grid-3">{exps.map((e) => <ExperienceCard key={e.slug} e={e} />)}{makers.map((m) => <MakerCard key={m.slug} m={m} />)}</div>
        </section>
      ) : null}
      {stay}
      <FeaturedBlock destName={d.name} />
      <AirportLine d={d.id} name={d.name} />
        <section className="wrap" id="s-weather" aria-labelledby="h-weather">
        <div className="sec-head"><h2 id="h-weather">Weather</h2><Link href="/weather">Every area, every month</Link></div>
        <WeatherNow d={d.id} name={d.name} />
        <h3 className="h-sub" style={{ marginTop: 40 }}>Month by month</h3>
        <ClimateChart d={d.id} name={d.name} />
      </section>
      <section className="wrap" id="s-plan" aria-labelledby="h-plan">
        <h2 id="h-plan" className="h-sub">Plan your visit</h2>
        <div className="split">
          <div>
            <Facts rows={(d.plan || []).map((r) => (r[0] === "Taxis" ? TAXI_ROW : r))} />
            <Sources list={[{ t: "Visit Cyprus: transport and taxi tariffs", u: "https://www.visitcyprus.com/" }]} reviewed="18 November 2026 (taxi tariff)" />
          </div>
          <div className="panel">
            <h3 style={{ fontSize: 22 }}>Good to know</h3>
            <p>Emergency numbers, taxi fares and getting around, all in one place.</p>
            <Link className="btn btn-ghost" href="/practical">Practical info</Link>
          </div>
        </div>
      </section>
      {d.next?.length ? (
        <section className="wrap" aria-labelledby="h-next">
          <div className="sec-head"><h2 id="h-next">Continue exploring</h2></div>
          <div className="grid">{d.next.map((n) => { const x = getDest(n); return x ? <DestCard key={n} d={x} /> : null; })}</div>
        </section>
      ) : null}
    </>
  );
}
