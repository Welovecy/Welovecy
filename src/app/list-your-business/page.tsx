import type { Metadata } from "next";
import { PageHead } from "@/components/Bits";

export const metadata: Metadata = { title: "List your business", description: "Get your business featured on We Love Cyprus." };

export default function ListBusiness() {
  return (
    <PageHead title="List your business" lead="Every listing is checked before it goes live. Basic listings are free." crumbs={[["Home", "/"], ["List your business"]]}>
      <div className="panel" style={{ maxWidth: 640 }}>
        <h2 style={{ fontSize: 24 }}>Listings open soon.</h2>
        <p className="muted">Licensed hotels, apartments, restaurants and bars already appear from the official tourism registers. Featured spots and maker pages open shortly.</p>
      </div>
      <div className="panel" id="update" style={{ maxWidth: 640 }}>
        <h2 style={{ fontSize: 24 }}>Something out of date?</h2>
        <p className="muted">Tell us through the We Love Cyprus group and we&apos;ll check it against the source before changing anything.</p>
      </div>
    </PageHead>
  );
}
