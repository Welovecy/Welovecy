import type { Metadata } from "next";
import { DESTINATIONS } from "@/lib/data";
import { PageHead } from "@/components/Bits";
import { ListingSection } from "@/components/Listing";

export const metadata: Metadata = { title: "Must-see", description: "The sights, views and days out worth planning around, area by area." };

export default function MustSee() {
  return (
    <>
      <PageHead title="Must-see" lead="The sights, views and days out worth planning around." crumbs={[["Home", "/"], ["Must-see"]]} />
      {DESTINATIONS.map((d) => <ListingSection key={d.id} dest={d.id} kind="sight" title={d.name} id={`ms-${d.id}`} />)}
    </>
  );
}
