import type { Metadata } from "next";
import { DESTINATIONS } from "@/lib/data";
import { DestCard } from "@/components/Cards";
import { PageHead } from "@/components/Bits";

export const metadata: Metadata = { title: "Destinations", description: "Ayia Napa, Protaras, Paphos, Limassol, Larnaca, Nicosia and the Troodos mountains." };

export default function Destinations() {
  return (
    <>
      <PageHead title="Destinations" lead="Every corner of the Republic of Cyprus, each with its own character." crumbs={[["Home", "/"], ["Destinations"]]} />
      <section className="wrap pad-top">
        <div className="grid">{DESTINATIONS.map((d, i) => <DestCard key={d.id} d={d} feature={i === 0} />)}</div>
      </section>
    </>
  );
}
