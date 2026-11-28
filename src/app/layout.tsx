import { ogMeta } from "@/lib/og";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RegisterSW } from "@/components/RegisterSW";
import { TabBar } from "@/components/TabBar";
import { THEME_SCRIPT } from "@/components/ThemeToggle";
import { EMAIL_BUSINESS, EMAIL_HELLO, FB_GROUP, FB_PAGE, SITE_NAME, SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Track } from "@/components/Track";
import { Consent } from "@/components/Consent";
import { InstallPrompt } from "@/components/InstallPrompt";
import { Ask } from "@/components/Ask";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "./" },
  title: { default: `${SITE_NAME}: a guide to the Republic of Cyprus`, template: `%s · ${SITE_NAME}` },
  description: "Beaches, must-see places and what's around your hotel, from the island's largest community.",
  applicationName: SITE_NAME,
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "default" },
  openGraph: ogMeta("/"),
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBFAF7" },
    { media: "(prefers-color-scheme: dark)", color: "#121315" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <JsonLd data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "Organization", "@id": `${SITE_URL}/#org`, name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/icons/icon-512.png`, sameAs: [FB_PAGE, FB_GROUP], email: EMAIL_HELLO, contactPoint: [{ "@type": "ContactPoint", contactType: "customer support", email: EMAIL_HELLO }, { "@type": "ContactPoint", contactType: "sales", email: EMAIL_BUSINESS }] },
            { "@type": "WebSite", "@id": `${SITE_URL}/#site`, name: SITE_NAME, url: SITE_URL, inLanguage: "en-GB", publisher: { "@id": `${SITE_URL}/#org` } },
          ],
        }} />
        <link rel="alternate" type="application/rss+xml" title="We Love Cyprus guides" href="/feed.xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Inter+Tight:wght@600;700&display=swap" />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Header />
        <main id="main" tabIndex={-1}>{children}</main>
        <Footer />
        <TabBar />
        <RegisterSW />
        <Analytics />
        <SpeedInsights />
        <Track />
        <Consent />
        <InstallPrompt />
        <Ask />
      </body>
    </html>
  );
}
