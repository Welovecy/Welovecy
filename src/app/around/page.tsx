import type { Metadata } from "next";
import { Crumbs } from "@/components/Bits";
import { AroundHome } from "@/components/AroundHome";

export const metadata: Metadata = { title: "Around you", description: "Find your hotel and see what's around it: beaches, sights, food, pharmacies and supermarkets, with distances." };

export default function Around() {
  return (
    <div className="wrap">
      <Crumbs items={[["Home", "/"], ["Around you"]]} />
      <AroundHome />
    </div>
  );
}
