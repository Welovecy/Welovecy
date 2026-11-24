import type { Metadata } from "next";
import Link from "next/link";
import { DESTINATIONS } from "@/lib/data";
import { areaName, goingHref, goingPages, venuesIn } from "@/lib/going";
import { PageHead } from "@/components/Bits";

export const metadata: Metadata = {
  title: "Where to eat and drink in Cyprus",
  description: "Restaurants, tavernas, cafés, bars and clubs across Cyprus, by area, cuisine and type. Every licensed place, sorted by distance.",
  alternates: { canonical: "/eat-drink" },
};

export default function GoingIndex() {
  const areas = DESTINATIONS.filter((d) => goingPages(d.id).length);
  return (
    <>
      <PageHead title="Eat and drink" lead="Choose your area, then a cuisine or a night out. Everything is sorted by distance from where you're staying." crumbs={[["Home", "/"], ["Eat and drink"]]} />
      <section className="wrap pad-top">
        <div className="going-grid">
          {areas.map((d) => {
            const top = goingPages(d.id).filter((p) => p.kind === "cuisine").sort((a, b) => b.list.length - a.list.length).slice(0, 3).map((p) => p.short);
            return (
              <Link key={d.id} className="going-tile" href={goingHref(d.id)}>
                <strong>{areaName(d.id)}</strong>
                <span>{venuesIn(d.id).length} places{top.length ? ` · ${top.join(", ")}` : ""}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
