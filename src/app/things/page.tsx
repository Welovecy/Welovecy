import type { Metadata } from "next";
import Link from "next/link";
import { INTERESTS } from "@/lib/data";
import { PageHead } from "@/components/Bits";

export const metadata: Metadata = { title: "Things to do", description: "Beaches, nature, culture, food and wine, villages and family days out." };

export default function Things() {
  return (
    <>
      <PageHead title="Things to do" lead="Start with what you love. We'll show you where to find it." crumbs={[["Home", "/"], ["Things to do"]]} />
      <section className="wrap pad-top">
        <div className="grid">
          {INTERESTS.map((i) => <Link key={i.id} className="card panel" style={{ gap: 6 }} href={`/things/${i.id}`}><h3>{i.name}</h3><p>{i.line}</p></Link>)}
        </div>
      </section>
    </>
  );
}
