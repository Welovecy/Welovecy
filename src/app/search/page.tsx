import type { Metadata } from "next";
import { AppHead } from "@/components/Bits";
import { SearchHome } from "@/components/SearchHome";

export const metadata: Metadata = { title: "Search", description: "Search areas, places, beaches, hotels, restaurants, bars and clubs across the Republic of Cyprus." };

export default function Search() {
  return (
    <div className="app-page">
      <AppHead title="Search" crumbs={[["Home", "/"], ["Search"]]}>
        <SearchHome />
      </AppHead>
    </div>
  );
}
