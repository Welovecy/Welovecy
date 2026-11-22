import type { Metadata } from "next";
import { DESTINATIONS } from "@/lib/data";
import Link from "next/link";
import { PageHead } from "@/components/Bits";
import { ListingSection } from "@/components/Listing";

export const metadata: Metadata = { title: "Must-see", description: "The sights, views and days out worth planning around, area by area." };

export default function MustSee() {
  return (
    <>
      <PageHead title="Must-see" lead="The sights, views and days out worth planning around." crumbs={[["Home", "/"], ["Must-see"]]}>
        <div className="chips">
          <Link className="chip stay-chip" href="/unesco">UNESCO World Heritage</Link>
          <Link className="chip stay-chip" href="/wine">Wine routes</Link>
          <Link className="chip stay-chip" href="/things/culture">Culture</Link>
          <Link className="chip stay-chip" href="/things/villages">Villages</Link>
        </div>
      </PageHead>
      {DESTINATIONS.map((d) => <ListingSection key={d.id} dest={d.id} kind="sight" title={d.name} id={`ms-${d.id}`} />)}
    </>
  );
}
