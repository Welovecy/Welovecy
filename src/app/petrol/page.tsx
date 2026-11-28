import { ogMeta } from "@/lib/og";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/Bits";
import { PetrolFinder, type Station } from "@/components/PetrolFinder";
import { DESTINATIONS, POIS } from "@/lib/data";
import { DEST_CENTRE } from "@/lib/centres";

export const metadata: Metadata = { openGraph: ogMeta("/petrol"),
  title: "Petrol near you",
  description: "The nearest petrol stations to you or your hotel anywhere in the Republic of Cyprus, with driving time, 24-hour stations and directions.",
  alternates: { canonical: "/petrol" },
};

export default function Petrol() {
  const stations: Station[] = POIS.filter((p) => p.k === "fuel" && p.ll).map((p) => ({ i: p.i, n: p.n, ll: p.ll!, brand: p.brand, h24: p.h24, tw: p.tw }));
  const areas = DESTINATIONS.map((d) => ({ id: d.id, label: d.name.split(" & ")[0].split(",")[0], ll: DEST_CENTRE[d.id] }));
  return (
    <>
      <PageHead title="Petrol near you" lead={`${stations.length} petrol stations across the Republic. See the nearest, how long the drive is, and which are open 24 hours.`} crumbs={[["Home", "/"], ["Practical info", "/practical"], ["Petrol near you"]]} />
      <section className="wrap pad-top">
        <PetrolFinder stations={stations} areas={areas} />
        <p className="small" style={{ marginTop: 18 }}>Every station by area: {DESTINATIONS.map((d, i) => <span key={d.id}>{i ? " · " : ""}<Link href={`/essentials/${d.id}/fuel`}>{d.name}</Link></span>)}</p>
        <p className="small">Hiring a car? <Link href="/essentials/larnaca/carhire">Car hire offices by area</Link> · <Link href="/guides/driving-in-cyprus">Driving in Cyprus</Link></p>
        <p className="tag">Locations: OpenStreetMap contributors, retrieved 27 November 2026.</p>
      </section>
    </>
  );
}
