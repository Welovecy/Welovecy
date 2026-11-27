import type { Metadata } from "next";
import Link from "next/link";
import { DESTINATIONS, POIS } from "@/lib/data";
import { PageHead } from "@/components/Bits";
import { ESS_KINDS } from "./kinds";

export const metadata: Metadata = { title: "Essentials", description: "Pharmacies, hospitals, clinics and supermarkets across the Republic of Cyprus, area by area." };

export default function Essentials() {
  return (
    <>
      <PageHead title="Essentials" lead="Every pharmacy in the official register, hospitals and clinics, and supermarkets, area by area." crumbs={[["Home", "/"], ["Essentials"]]} />
      <section className="wrap pad-top">
        <div className="duty-banner" style={{ marginBottom: 20 }}>
          <span>Need a pharmacy late at night?</span>
          <Link className="btn btn-primary" href="/pharmacies-on-duty">See tonight&apos;s duty pharmacies</Link>
        </div>
        <div className="grid">
          {DESTINATIONS.map((d) => (
            <div key={d.id} className="panel" style={{ gap: 10 }}>
              <h2 style={{ fontSize: 24 }}>{d.name}</h2>
              {ESS_KINDS.map(([k, name]) => (
                <Link key={k} href={`/essentials/${d.id}/${k}`}>{name} ({POIS.filter((r) => r.d === d.id && r.k === k && r.src !== "osm").length})</Link>
              ))}
            </div>
          ))}
        </div>
        <p className="tag" style={{ marginTop: 20 }}>In an emergency call 112 or 199.</p>
      </section>
    </>
  );
}
