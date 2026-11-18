import Link from "next/link";
import { DESTINATIONS, EXPERIENCES, INTERESTS, getPlace, photoFor } from "@/lib/data";
import { DestCard, ExperienceCard, PlaceCard } from "@/components/Cards";
import { HeroStage } from "@/components/HeroStage";
import { WhereSearch } from "@/components/WhereSearch";
import { HomeBase } from "@/components/HomeBase";

const BEACHES: [string, string][] = [
  ["nissi", "Soft sand and shallow water, a short walk from Ayia Napa."],
  ["fig-tree-bay", "Calm, clear water and an islet to swim to."],
  ["konnos", "A sheltered turquoise cove below the pines."],
  ["makronissos", "Quieter coves with ancient tombs nearby."],
];
const MUST: [string, string][] = [
  ["cape-greco", "Cliffs, caves and the clearest blue on the east coast."],
  ["aphrodite-rock", "Where the goddess of love rose from the waves."],
  ["kato-paphos", "Roman mosaics a short walk from the harbour."],
  ["lefkara", "Lace, silver and stone lanes in the hills above Larnaca."],
];

function Picks({ list }: { list: [string, string][] }) {
  return (
    <div className="grid">
      {list.map(([slug, why]) => { const p = getPlace(slug); return p ? <PlaceCard key={slug} p={p} why={why} /> : null; })}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <div className="wrap hero">
        <HeroStage photo={photoFor("home-hero")} label="Aphrodite's Rock at sunset" tint="#7E8EA0" />
        <div className="hero-copy">
          <p className="eyebrow">Cyprus, the island of love</p>
          <h1>Fall for it.</h1>
          <p className="lead">Legend says Aphrodite rose from the sea here. Millions of us have been falling for this island ever since. Come find your own reason.</p>
          <WhereSearch />
        </div>
      </div>
      <HomeBase />
      <section className="wrap" aria-labelledby="h-areas" style={{ paddingTop: 24 }}>
        <h2 id="h-areas" style={{ fontSize: 24, marginBottom: 14 }}>Or explore an area</h2>
        <div className="chips stay-chips">
          {DESTINATIONS.map((d) => <Link key={d.id} className="chip" href={`/destinations/${d.id}`}>{d.name}</Link>)}
        </div>
      </section>
      <section className="wrap" aria-labelledby="h-dest">
        <div className="sec-head"><h2 id="h-dest">Choose a destination</h2></div>
        <div className="grid">{DESTINATIONS.map((d, i) => <DestCard key={d.id} d={d} feature={i === 0} />)}</div>
      </section>
      <section className="wrap" aria-labelledby="h-beach">
        <div className="sec-head"><h2 id="h-beach">Beaches to start with</h2><Link href="/beaches">All beaches</Link></div>
        <Picks list={BEACHES} />
      </section>
      <section className="wrap" aria-labelledby="h-int">
        <div className="sec-head"><h2 id="h-int">Explore by interest</h2></div>
        <div className="grid">
          {INTERESTS.map((i) => (
            <Link key={i.id} className="card panel" style={{ gap: 6 }} href={`/things/${i.id}`}><h3>{i.name}</h3><p>{i.line}</p></Link>
          ))}
        </div>
      </section>
      <section className="wrap" aria-labelledby="h-must">
        <div className="sec-head"><h2 id="h-must">Must-see</h2><Link href="/must-see">See them all</Link></div>
        <Picks list={MUST} />
      </section>
      <section className="wrap" aria-labelledby="h-people">
        <div className="sec-head"><h2 id="h-people">Meet the people behind the places</h2><Link href="/stories">All stories</Link></div>
        <div className="grid-3">{EXPERIENCES.map((e) => <ExperienceCard key={e.slug} e={e} />)}</div>
      </section>
      <section className="wrap">
        <div className="panel" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", alignItems: "center" }}>
          <div style={{ display: "grid", gap: 10 }}>
            <h2 style={{ fontSize: "clamp(28px,4vw,40px)" }}>Save your Cyprus.</h2>
            <p className="muted">Tap the heart on any place to keep it. No account needed. Your list stays on this device.</p>
          </div>
          <div><Link className="btn btn-primary" href="/saved">See saved places</Link></div>
        </div>
      </section>
    </>
  );
}
