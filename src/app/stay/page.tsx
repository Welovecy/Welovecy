import type { Metadata } from "next";
import Link from "next/link";
import { DESTINATIONS, DEST_CENTRE, photoFor } from "@/lib/data";
import { AppHead } from "@/components/Bits";
import { WhereSearch } from "@/components/WhereSearch";
import { IslandMap } from "@/components/IslandMap";
import { staysIn } from "@/lib/views";

export const metadata: Metadata = { title: "Where to stay", description: "Every licensed hotel and apartment in the Republic of Cyprus, with what's around each one." };

const thumb = (u?: string) => (u && /\/\d+px-/.test(u) ? u.replace(/\/\d+px-/, "/330px-") : u);

export default function Stay() {
  const areas = DESTINATIONS.map((d) => ({ d, n: staysIn(d.id).length, img: thumb(photoFor(`dest-${d.id}`)?.u) })).sort((a, b) => b.n - a.n);
  const top = areas[0]?.d.id;
  return (
    <div className="sheet-page">
      <AppHead title="Where to stay" crumbs={[["Home", "/"], ["Where to stay"]]} />
      <div className="wrap">
        <IslandMap label="Places to stay by area" pins={areas.map(({ d, n }) => ({ ll: d.id === "protaras" ? [35.1, 34.06] as [number, number] : DEST_CENTRE[d.id], label: d.name, href: `/stay/${d.id}`, count: n, on: d.id === top }))} />
      </div>
      <section className="sheet" aria-labelledby="h-areas">
        <div className="wrap sheet-in">
          <span className="grab" aria-hidden="true" />
          <WhereSearch scope="stay" placeholder="Find your hotel or apartment" label="Find your hotel or apartment" hint="Every licensed place, by area. Pick one to see what's around it." />
          <h2 id="h-areas" className="sheet-h">By area</h2>
          <ul className="rows rows-flat">
            {areas.map(({ d, n, img }) => (
              <li key={d.id}>
                <Link className="row" href={`/stay/${d.id}`}>
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="row-img" src={img} alt="" loading="lazy" decoding="async" width={52} height={52} />
                  ) : <span className="mono" aria-hidden="true">{d.name[0]}</span>}
                  <span className="rowtxt"><strong>{d.name}</strong><span>{n} licensed places to stay</span></span>
                  <span className="chev" aria-hidden="true">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
