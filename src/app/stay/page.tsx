import type { Metadata } from "next";
import Link from "next/link";
import { DESTINATIONS } from "@/lib/data";
import { PageHead } from "@/components/Bits";
import { WhereSearch } from "@/components/WhereSearch";
import { staysIn } from "@/lib/views";

export const metadata: Metadata = { title: "Where to stay", description: "Every licensed hotel and apartment in the Republic of Cyprus, with what's around each one." };

export default function Stay() {
  return (
    <>
      <PageHead title="Where to stay" lead="Every licensed hotel and apartment. Search one to see the beaches, sights and essentials around it, whether you've booked or you're still choosing." crumbs={[["Home", "/"], ["Where to stay"]]}>
        <WhereSearch scope="stay" placeholder="Search a hotel or apartment" label="Search a hotel or apartment" />
      </PageHead>
      <section className="wrap" aria-labelledby="h-areas">
        <div className="sec-head"><h2 id="h-areas">By area</h2></div>
        <ul className="rows">
          {DESTINATIONS.map((d) => (
            <li key={d.id}>
              <Link className="row" href={`/stay/${d.id}`}>
                <span className="mono" aria-hidden="true">{d.name[0]}</span>
                <span className="rowtxt"><strong>{d.name}</strong><span>{staysIn(d.id).length} licensed places to stay</span></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
