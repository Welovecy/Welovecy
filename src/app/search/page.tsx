import type { Metadata } from "next";
import { PageHead } from "@/components/Bits";
import { WhereSearch } from "@/components/WhereSearch";

export const metadata: Metadata = { title: "Search", description: "Search areas, places, beaches, hotels, restaurants, bars and clubs across the Republic of Cyprus." };

export default function Search() {
  return (
    <PageHead title="Search" crumbs={[["Home", "/"], ["Search"]]}>
      <WhereSearch autoFocus placeholder="Try Nissi Beach, a hotel or Castle Club" label="Search places, beaches, hotels, restaurants and bars" hint="Understands local spellings: Larnaka, Lefkosia, Lemesos, Pafos, Agia Napa." />
    </PageHead>
  );
}
