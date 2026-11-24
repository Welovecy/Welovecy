import type { Metadata } from "next";
import { PageHead } from "@/components/Bits";
import { EMAIL_HELLO } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy", description: "What we measure on We Love Cyprus, what we don't, and the choices you have." };

export default function Privacy() {
  return (
    <PageHead title="Privacy" lead="Short version: we count visits to make the guide better. We don't run ads, and we never sell data." crumbs={[["Home", "/"], ["Privacy"]]}>
      <div className="prose" style={{ maxWidth: 760 }}>
        <h2>Who we are</h2>
        <p>We Love Cyprus (welovecy.com) is run by The One Experience Adufe Ltd, Paralimni, Cyprus. Questions about your data: <a href={`mailto:${EMAIL_HELLO}`}>{EMAIL_HELLO}</a>.</p>
        <h2>Always on, no cookies</h2>
        <p>We use Vercel Web Analytics and Speed Insights to count page views, where visits come from (for example Facebook or Google), the country, the type of device, and which buttons get tapped, such as Call or Find on map. They don&apos;t use cookies and don&apos;t identify you. We see totals, not people.</p>
        <h2>Only if you say yes</h2>
        <p>If you accept cookies, we also use Microsoft Clarity. It shows us how pages are used: where people tap, how far they scroll and where they get stuck, including anonymous replays of visits. Clarity masks what you type into forms. Microsoft processes this data for us. You can change your mind any time with Cookie settings at the bottom of every page.</p>
        <h2>Stays on your phone</h2>
        <p>Places you save and the hotel you mark as &ldquo;I&apos;m staying here&rdquo; are stored in your own browser. They never reach us.</p>
        <h2>If you contact us</h2>
        <p>If you email us, we keep your message and address to reply and for our records. We don&apos;t add you to any list without asking.</p>
        <h2>Your rights</h2>
        <p>You can ask what we hold about you, ask us to correct or delete it, or object to how it&apos;s used. Write to {EMAIL_HELLO}. You can also complain to the Commissioner for Personal Data Protection in Cyprus (dataprotection.gov.cy).</p>
        <p className="muted small">Last updated 24 November 2026.</p>
      </div>
    </PageHead>
  );
}
