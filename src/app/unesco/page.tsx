import type { Metadata } from "next";
import Link from "next/link";
import { PLACES } from "@/lib/data";
import { PageHead, Sources } from "@/components/Bits";
import { ListRow } from "@/components/ListRow";
import { UnescoBadge, UNESCO_NAMES } from "@/components/Guide";
import { placeRow } from "@/lib/views";
import type { UnescoId } from "@/lib/types";

export const metadata: Metadata = { title: "UNESCO World Heritage", description: "The three World Heritage properties in the Republic of Cyprus: Paphos, Choirokoitia and the ten painted churches of the Troodos." };

const PROPS: [UnescoId, string, string][] = [
  ["paphos", "Roman villa mosaics by the harbour, the rock-cut Tombs of the Kings and the Sanctuary of Aphrodite at Kouklia. Each has its own entrance.", "https://whc.unesco.org/en/list/79/"],
  ["choirokoitia", "A Neolithic settlement with reconstructed round houses, between Larnaca and Limassol.", "https://whc.unesco.org/en/list/848/"],
  ["troodos", "Ten frescoed churches and monasteries in the Troodos villages. Opening often depends on a keyholder, so check before driving between them.", "https://whc.unesco.org/en/list/351/"],
];

export default function Unesco() {
  return (
    <>
      <PageHead title="UNESCO World Heritage" lead="Three World Heritage properties, including all ten painted churches in the Troodos inscription. Check opening, access and transport back before you go." crumbs={[["Home", "/"], ["Must-see", "/must-see"], ["UNESCO"]]} />
      {PROPS.map(([id, line, u]) => {
        const list = PLACES.filter((p) => p.unesco === id);
        return (
          <section key={id} className="wrap" id={id} aria-labelledby={`h-${id}`}>
            <div className="sec-head"><h2 id={`h-${id}`}>{UNESCO_NAMES[id]}</h2><span className="muted">{list.length} {list.length === 1 ? "site" : "sites"}</span></div>
            <p className="muted" style={{ maxWidth: 680, marginBottom: 14 }}>{line} <a href={u} target="_blank" rel="noopener noreferrer">UNESCO listing</a></p>
            <ul className="rows">{list.map((p) => <ListRow key={p.slug} {...placeRow(p)} sub={p.loc ?? p.cat} save />)}</ul>
          </section>
        );
      })}
      <section className="wrap">
        <div className="panel" style={{ gap: 10 }}>
          <UnescoBadge id="paphos" />
          <p>Every World Heritage site also shows on the map, so any hotel&apos;s <Link href="/around">what&apos;s around</Link> page tells you how far it is.</p>
        </div>
        <Sources list={PROPS.map(([id, , u]) => ({ t: `UNESCO: ${UNESCO_NAMES[id]}`, u }))} reviewed="2026-11-22" />
      </section>
    </>
  );
}
