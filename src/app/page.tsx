import { StoriesSoon } from "@/components/StoriesSoon";
import { Community } from "@/components/Community";
import Link from "next/link";
import { DESTINATIONS, EXPERIENCES, INTERESTS, getPlace, photoFor } from "@/lib/data";
import { DestCard, ExperienceCard, PlaceCard } from "@/components/Cards";
import { HeroStage } from "@/components/HeroStage";
import { WhereSearch } from "@/components/WhereSearch";
import { HomeBase } from "@/components/HomeBase";
import { QuestionOfTheDay } from "@/components/Quiz";
import { HeroDemo, type DemoStop } from "@/components/HeroDemo";
import { BUS, BUSINESSES, POIS, getBusiness, getDest, isStay, listingHref, spots } from "@/lib/data";
import { essentials } from "@/lib/around";
import { WALK_MAX_KM, driveMinutes, walkMinutes } from "@/lib/geo";
import { ESSENTIAL_LABEL, KINDS } from "@/lib/kinds";
import { HomeHero, QuickLinks, RightNow } from "@/components/HomeHero";
import { DISTRICTS, cyToday, dutyOn } from "@/lib/duty";
import { AskBar } from "@/components/Ask";

/** Rebuilt every 10 minutes so tonight's pharmacy count is always today's. */
export const revalidate = 600;

/** The opening line. Swap here to test another headline. */
const HEADLINE = "Know Cyprus like a local.";
const LEAD = "Visiting or living here? Where to go, what's nearby, how to get there. And much more.";

/** Real hotels in each holiday area, in the order guests ask about them. [id, name to type] */
const SHOWCASE: [string, string][] = [
  ["cy-00052", "Olympic Lagoon"], ["cy-02787", "Cap St Georges"], ["wlc-0001", "Sunrise Pearl"],
  ["cy-01758", "Parklane"], ["cy-00691", "Radisson Blu"],
];

/** "Pharmacy" for pharmacies listed under the pharmacist's Greek name; chain branches lose their street. */
function displayName(kind: string, n: string) {
  if (kind === "pharmacy" && /[\u0370-\u03ff]/.test(n)) return "Pharmacy";
  if (kind === "market") return n.split(",")[0].trim();
  return n;
}

function demoStops(): DemoStop[] {
  const pool = spots();
  const hotels: DemoStop[] = SHOWCASE.map(([id, short]) => ({ b: getBusiness(id), short })).filter((x) => x.b?.ll).map(({ b, short }) => ({
    name: short,
    area: (b!.tw && b!.tw !== "Not specified" ? b!.tw : getDest(b!.d)?.name) ?? "",
    href: `${listingHref(b!.i)}/around`,
    rows: essentials(b!.ll!, pool, b!.i).filter((e) => e.near).map((e) => ({
      k: e.kind,
      label: ((l) => l.charAt(0).toUpperCase() + l.slice(1))((ESSENTIAL_LABEL[e.kind] ?? "").replace("Nearest ", "")),
      name: displayName(e.kind, e.near!.s.n),
      time: `${e.near!.d <= WALK_MAX_KM ? walkMinutes(e.near!.d) : driveMinutes(e.near!.d)} min`,
      mode: (e.near!.d <= WALK_MAX_KM ? "walk" : "drive") as "walk" | "drive",
      color: KINDS[e.kind].c,
      extra: e.kind === "bus" && e.near!.s.rt?.length ? `Bus ${e.near!.s.rt.slice(0, 3).join(", ")}` : undefined,
    })),
  }));
  const fmt = (n: number) => n.toLocaleString("en-GB");
  const beaches = POIS.filter((r) => r.k === "beach");
  const final: DemoStop = {
    name: "We Love Cyprus", area: "Your guide to the whole island", href: "/destinations",
    pre: "All of Cyprus,", typed: "in one place", post: ".", cta: "Start exploring",
    rows: [
      { k: "beach", label: "Beaches", name: `${fmt(beaches.length)} public beaches, Blue Flag marked`, time: "", color: KINDS.beach.c },
      { k: "stay", label: "Places to stay", name: `${fmt(BUSINESSES.filter(isStay).length)} licensed hotels and apartments`, time: "", color: KINDS.sight.c },
      { k: "eat", label: "Eat & drink", name: `${fmt(BUSINESSES.filter((b) => !isStay(b)).length)} restaurants, cafés and bars`, time: "", color: KINDS.eat.c },
      { k: "pharmacy", label: "Essentials", name: "Pharmacies, clinics, supermarkets", time: "", color: KINDS.pharmacy.c },
      { k: "bus", label: "Buses", name: `${fmt(Object.keys(BUS.routes).length)} routes and airport transfers`, time: "", color: KINDS.bus.c },
    ],
  };
  return [...hotels, final];
}

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
      <div className="wrap">
        <HomeHero>
          <p className="eyebrow">From the We Love Cyprus community</p>
          <h1 className="vhero-title">{HEADLINE}</h1>
          <p className="vhero-lead">{LEAD}</p>
          <RightNow pharmacies={DISTRICTS.reduce((n, d) => n + (dutyOn(d.id, cyToday())?.length ?? 0), 0)} />
          <QuickLinks />
        </HomeHero>
        <AskBar />
      </div>
      <HomeBase />
      <section className="wrap" aria-label="What's around your hotel" style={{ paddingTop: 28 }}>
        <div className="sec-head"><h2 style={{ fontSize: 24 }}>Staying somewhere? See what&apos;s around you.</h2></div>
        <div className="hero2 hero2-second">
          <HeroStage photo={photoFor("home-hero")} label="Aphrodite's Rock at sunset" tint="#7E8EA0" />
          <div className="hero2-inner">
            <HeroDemo stops={demoStops()} />
            <WhereSearch placeholder="Your hotel, town or beach" hint="Walking and driving times are estimates. For example Protaras, Nissi Beach or Paphos." />
          </div>
        </div>
        <div className="intro-line">
          <p>Legend says Aphrodite rose from the sea here. Millions of us have been falling for this island ever since. <span className="muted">Come find your own reason.</span></p>
        </div>
      </section>
      <section className="wrap" aria-labelledby="h-areas" style={{ paddingTop: 24 }}>
        <h2 id="h-areas" style={{ fontSize: 24, marginBottom: 14 }}>Explore by area</h2>
        <div className="chips stay-chips">
          {DESTINATIONS.map((d) => <Link key={d.id} className="chip" href={`/destinations/${d.id}`}>{d.name}</Link>)}
        </div>
        <p style={{ marginTop: 14 }}><Link href="/pharmacies-on-duty">Pharmacies on duty tonight</Link> · <Link href="/weather">Weather now</Link> · <Link href="/practical#emergency">Emergency numbers</Link></p>
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
      <section className="wrap" aria-labelledby="h-play">
        <div className="sec-head"><h2 id="h-play">How well do you know Cyprus?</h2><Link href="/quiz">Take the quiz</Link></div>
        <QuestionOfTheDay />
      </section>
      <section className="wrap" aria-labelledby="h-people">
        <div className="sec-head"><h2 id="h-people">Meet the people behind the places</h2>{EXPERIENCES.length ? <Link href="/stories">All stories</Link> : null}</div>
        {EXPERIENCES.length ? <div className="grid-3">{EXPERIENCES.map((e) => <ExperienceCard key={e.slug} e={e} />)}</div> : <StoriesSoon />}
      </section>
      <Community />
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
