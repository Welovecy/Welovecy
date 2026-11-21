import Link from "next/link";
import type { LL } from "@/lib/types";
import type { Base } from "@/lib/store";
import { aroundData } from "@/lib/views";
import { getDest } from "@/lib/data";
import { directionsTo } from "@/lib/geo";
import { Crumbs } from "./Bits";
import { EssentialsGrid } from "./Essentials";
import { AroundExplorer } from "./AroundExplorer";
import { FeaturedBlock } from "./Cards";
import { FromBase } from "./FromBase";
import { StayHere } from "./StayHere";
import { BusesNear } from "./Buses";

const TOWN: Record<string, string> = { ayianapa: "Ayia Napa", protaras: "Protaras", paphos: "Paphos", limassol: "Limassol", larnaca: "Larnaca", nicosia: "Nicosia" };

interface Props { ll: LL; name: string; sub: string; back: string; skip: string; stay?: Base }

export function AroundPage({ ll, name, sub, back, skip, stay }: Props) {
  const a = aroundData(ll, skip);
  const dest = getDest(a.dest);
  return (
    <>
      <div className="wrap">
        <Crumbs items={[["Home", "/"], [name, back], ["What's around"]]} />
        <div className="around-head">
          <p className="eyebrow">{stay ? "What's around this hotel" : "Exploring around"} · {sub}</p>
          <h1>{name}</h1>
          <FromBase ll={ll} skip={stay?.id} />
          <div className="actions">
            {stay ? <StayHere base={stay} /> : null}
            <a className={`btn ${stay ? "btn-ghost" : "btn-primary"}`} href={directionsTo(ll)} target="_blank" rel="noopener noreferrer">Get directions</a>
            <Link className="btn btn-ghost" href={back}>{stay ? "Hotel details" : "About this place"}</Link>
          </div>
        </div>
      </div>
      <section className="wrap" aria-labelledby="h-ess" style={{ paddingBottom: 24 }}>
        <h2 id="h-ess" style={{ fontSize: 28, marginBottom: 16 }}>Closest to {name}</h2>
        <EssentialsGrid items={a.essentials} area={a.dest} areaName={dest?.name ?? ""} busHref="#buses" />
      </section>
      <section className="wrap" aria-labelledby="h-ar" style={{ paddingTop: 24 }}>
        <h2 id="h-ar" style={{ fontSize: 28, marginBottom: 16 }}>What&apos;s around</h2>
        <AroundExplorer center={ll} label={name} lists={a.lists} />
      </section>
      <BusesNear ll={ll} here={TOWN[a.dest] ?? ""} />
      {dest ? <FeaturedBlock destName={dest.name} /> : null}
    </>
  );
}
