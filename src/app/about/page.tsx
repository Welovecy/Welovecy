import type { Metadata } from "next";
import { PageHead } from "@/components/Bits";

export const metadata: Metadata = { title: "About", description: "We Love Cyprus started as the island's largest Facebook community." };

export default function About() {
  return (
    <PageHead title="About" lead="We Love Cyprus started as the island's largest Facebook community. This guide brings what members know into one place." crumbs={[["Home", "/"], ["About"]]}>
      <div className="prose">
        <p>Everything here covers the Republic of Cyprus. Facts come from official registers and tourism sources, listed at the end of each page with the date we last checked them.</p>
        <p>Our must-see picks are never paid for. Featured spots from local partners are always marked as featured.</p>
        <p className="muted small">We Love Cyprus is run by The One Experience Adufe Ltd.</p>
      </div>
    </PageHead>
  );
}
