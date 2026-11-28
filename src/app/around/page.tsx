import { ogMeta } from "@/lib/og";
import type { Metadata } from "next";
import { DESTINATIONS, DEST_CENTRE, photoFor } from "@/lib/data";
import { AroundHome, type Town } from "@/components/AroundHome";

export const metadata: Metadata = { openGraph: ogMeta("/around"), title: "Around you", description: "Find your hotel and see what's around it: beaches, sights, food, pharmacies and supermarkets, with distances." };

const card = (u?: string) => (u && /\/\d+px-/.test(u) ? u.replace(/\/\d+px-/, "/500px-") : u);

export default function Around() {
  const towns: Town[] = DESTINATIONS.map((d) => ({ id: d.id, n: d.name, ll: DEST_CENTRE[d.id], img: card(photoFor(`dest-${d.id}`)?.u) }));
  return <AroundHome towns={towns} />;
}
