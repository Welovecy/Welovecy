import type { Metadata } from "next";
import { PageHead } from "@/components/Bits";
import { EMAIL_HELLO } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy", description: "How We Love Cyprus handles data: what we measure, cookies, and your choices." };

export default function Privacy() {
  return (
    <PageHead title="Privacy" lead="We count visits to make the guide better. No ads, and we never sell data." crumbs={[["Home", "/"], ["Privacy"]]}>
      <div className="prose" style={{ maxWidth: 760 }}>
        <h2>What we measure</h2>
        <p>We use Vercel Web Analytics and Speed Insights to count page views, where visits come from (for example Facebook or Google), the country, the type of device, and which buttons get tapped, such as Call or Find on map. They don&apos;t use cookies and don&apos;t identify you. We see totals, not people.</p>
        <h2>Cookies</h2>
        <p>If you accept cookies, we also use Microsoft Clarity to see how pages are used: where people tap, how far they scroll and where they get stuck, including anonymous replays of visits. Clarity hides anything typed into forms. If you decline, Clarity doesn&apos;t load. You can change your choice any time with Cookie settings at the bottom of every page.</p>
        <h2>Saved places</h2>
        <p>Places you save and the hotel you mark as &ldquo;I&apos;m staying here&rdquo; are kept in your own browser. They never reach us.</p>
        <h2>If you email us</h2>
        <p>We keep your message and address to reply and for our records. We don&apos;t add you to any mailing list without asking.</p>
        <h2>Your rights</h2>
        <p>You can ask what we hold about you, ask us to correct or delete it, or object to how it&apos;s used. Write to <a href={`mailto:${EMAIL_HELLO}`}>{EMAIL_HELLO}</a>. We Love Cyprus is run by The One Experience Adufe Ltd, Paralimni, Cyprus.</p>
        <p className="muted small">You also have the right to lodge a complaint with the Office of the Commissioner for Personal Data Protection in Cyprus.</p>
        <p className="muted small">Last updated 25 November 2026.</p>
      </div>
    </PageHead>
  );
}
