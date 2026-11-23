import type { Metadata } from "next";
import Link from "next/link";
import { DESTINATIONS } from "@/lib/data";
import { BEACH_HOTELS, NEAR_KM, WALK_KM, hotelsNearHref } from "@/lib/hotelsNear";
import { PageHead } from "@/components/Bits";

export const metadata: Metadata = {
  title: "Hotels near the beach in Cyprus",
  description: "Find licensed hotels and apartments close to Cyprus's best-known beaches, from Nissi and Fig Tree Bay to Coral Bay and Finikoudes. Closest first, with walking times.",
  alternates: { canonical: "/hotels-near" },
};

export default function HotelsNearIndex() {
  const groups = DESTINATIONS.map((d) => ({ d, list: BEACH_HOTELS.filter((b) => b.d === d.id) })).filter((g) => g.list.length);
  return (
    <>
      <PageHead
        title="Hotels near the beach"
        lead={`Pick your beach and see every licensed hotel and apartment within ${NEAR_KM} km, with the ones under ${WALK_KM * 1000} m from the sand first.`}
        crumbs={[["Home", "/"], ["Where to stay", "/stay"], ["Hotels near the beach"]]}
      />
      {groups.map(({ d, list }) => (
        <section key={d.id} className="wrap" aria-labelledby={`h-${d.id}`}>
          <div className="sec-head"><h2 id={`h-${d.id}`}>{d.name}</h2><Link href={`/stay/${d.id}`}>All places to stay</Link></div>
          <ul className="rows" style={{ maxWidth: 760 }}>
            {list.map((b) => {
              const close = b.hotels.filter((h) => h.d <= WALK_KM).length;
              return (
                <li key={b.slug}>
                  <Link className="row" href={hotelsNearHref(b.slug)}>
                    <span className="mono k" aria-hidden="true" style={{ background: "#2E6E8E" }}>B</span>
                    <span className="rowtxt"><strong>Hotels near {b.name}</strong><span>{[b.town, close ? `${close} a short walk away` : null, `${b.hotels.length} within ${NEAR_KM} km`].filter(Boolean).join(" · ")}</span></span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </>
  );
}
