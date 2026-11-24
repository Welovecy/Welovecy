import type { Metadata } from "next";
import { PageHead } from "@/components/Bits";
import { EMAIL_BUSINESS, EMAIL_HELLO } from "@/lib/site";

export const metadata: Metadata = { title: "About", description: "We Love Cyprus started as the island's largest Facebook community." };

export default function About() {
  return (
    <PageHead title="About" lead="We Love Cyprus started as the island's largest Facebook community. This guide brings what members know into one place." crumbs={[["Home", "/"], ["About"]]}>
      <div className="prose">
        <p>Everything here covers the Republic of Cyprus. Facts come from official registers and tourism sources, listed at the end of each page with the date we last checked them.</p>
        <p>Our must-see picks are never paid for. Featured spots from local partners are always marked as featured.</p>
        <h2 id="contact">Get in touch</h2>
        <p>Questions, tips or something we got wrong: <a href={`mailto:${EMAIL_HELLO}`}>{EMAIL_HELLO}</a></p>
        <p>Hotels, restaurants, partners and advertising: <a href={`mailto:${EMAIL_BUSINESS}`}>{EMAIL_BUSINESS}</a></p>
        <p className="muted small">We Love Cyprus is run by The One Experience Adufe Ltd.</p>
      </div>
    </PageHead>
  );
}
