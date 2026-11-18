import type { Metadata } from "next";
import { PageHead } from "@/components/Bits";
import { WhereSearch } from "@/components/WhereSearch";

export const metadata: Metadata = { title: "Search", description: "Search areas, places, beaches and hotels across the Republic of Cyprus." };

export default function Search() {
  return (
    <PageHead title="Search" crumbs={[["Home", "/"], ["Search"]]}>
      <WhereSearch autoFocus placeholder="Try Larnaka, Nissi Beach or a hotel" label="Search places, beaches and hotels" hint="Understands local spellings: Larnaka, Lefkosia, Lemesos, Pafos, Agia Napa." />
    </PageHead>
  );
}
