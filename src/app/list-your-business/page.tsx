import type { Metadata } from "next";
import { PageHead } from "@/components/Bits";
import { EMAIL_BUSINESS, EMAIL_HELLO } from "@/lib/site";

export const metadata: Metadata = {
  title: "List your business",
  description: "Get your hotel, restaurant or bar featured on We Love Cyprus. Send us your photo, a correction or a new listing.",
};

export default function ListBusiness() {
  return (
    <PageHead title="List your business" lead="Every listing is checked before it goes live. Basic listings are free." crumbs={[["Home", "/"], ["List your business"]]}>
      <div className="panel" style={{ maxWidth: 640 }}>
        <h2 style={{ fontSize: 24 }}>Already licensed? You&apos;re probably here.</h2>
        <p className="muted">Licensed hotels, apartments, restaurants and bars appear from the official tourism registers, with what&apos;s around them. Search for your business, then email us to make your page stand out.</p>
        <p style={{ margin: 0 }}>Send your best photo, an update or a new listing to <a href={`mailto:${EMAIL_BUSINESS}`}><strong>{EMAIL_BUSINESS}</strong></a>. Tell us the name as it appears on the site, and confirm the photo is yours to share.</p>
        <p className="muted small" style={{ margin: 0 }}>Featured spots open soon. Our must-see picks are never paid for, and featured spots are always marked.</p>
      </div>
      <div className="panel" id="update" style={{ maxWidth: 640 }}>
        <h2 style={{ fontSize: 24 }}>Something out of date?</h2>
        <p className="muted">Email <a href={`mailto:${EMAIL_HELLO}`}>{EMAIL_HELLO}</a> or tell us through the We Love Cyprus group. We check every change against the source before making it.</p>
      </div>
    </PageHead>
  );
}
