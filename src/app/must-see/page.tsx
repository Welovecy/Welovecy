import { ogMeta } from "@/lib/og";
import type { Metadata } from "next";
import { DESTINATIONS, photoFor } from "@/lib/data";
import Link from "next/link";
import { AppHead } from "@/components/Bits";
import { ListingSection } from "@/components/Listing";

export const metadata: Metadata = { openGraph: ogMeta("/must-see"), title: "Must-see", description: "The sights, views and days out worth planning around, area by area." };

const big = (u?: string) => (u && /\/\d+px-/.test(u) ? u.replace(/\/\d+px-/, "/960px-") : u);
const SHORT: Record<string, string> = { ayianapa: "Ayia Napa", protaras: "Protaras", paphos: "Paphos", akamas: "Polis & Akamas", limassol: "Limassol", larnaca: "Larnaca", nicosia: "Nicosia", troodos: "Troodos" };

export default function MustSee() {
  const story = photoFor("place-tombs-kings");
  return (
    <div className="app-page">
      <AppHead title="Must-see" crumbs={[["Home", "/"], ["Must-see"]]} />
      <div className="wrap">
        <Link href="/unesco" className="story">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {story ? <img src={big(story.u)} alt={story.t} fetchPriority="high" decoding="async" /> : null}
          <span className="story-top"><span className="story-eye">UNESCO World Heritage</span><b>The three World Heritage sites</b></span>
          <span className="story-bot">Paphos, Choirokoitia and the ten painted churches of the Troodos</span>
        </Link>
        <div className="chips coll">
          <Link className="chip" href="/wine">Wine routes</Link>
          <Link className="chip" href="/things/culture">Culture</Link>
          <Link className="chip" href="/things/villages">Villages</Link>
        </div>
      </div>
      <nav className="area-chips" aria-label="Jump to an area">
        <div className="wrap">
          {DESTINATIONS.map((d) => <a key={d.id} className="chip" href={`#ms-${d.id}`}>{SHORT[d.id] ?? d.name}</a>)}
        </div>
      </nav>
      {DESTINATIONS.map((d) => <ListingSection key={d.id} dest={d.id} kind="sight" title={d.name} id={`ms-${d.id}`} fold={4} />)}
    </div>
  );
}
