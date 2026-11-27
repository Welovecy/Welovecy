import Link from "next/link";
import { PARTNER_LABEL, partnerHref, type Partner } from "@/lib/partners";

/** One quiet, clearly labelled card after a guide's own advice. Never above it, never instead of it. */
export function PartnerSlot({ p }: { p: Partner }) {
  return (
    <aside className="partner-slot" aria-label={PARTNER_LABEL}>
      <p className="eyebrow">{PARTNER_LABEL}</p>
      {p.services.includes("car_hire") ? (
        <>
          <h2>Hiring a car in {p.coverage.areas?.length ? p.coverage.label.split(" and ")[0] : p.coverage.label}?</h2>
          <p><strong>{p.name}</strong> is a local car hire firm. {p.intro.split(". ").slice(1).join(". ")} You book and confirm the price directly with them.</p>
        </>
      ) : (
        <>
          <h2>Rather be met at arrivals?</h2>
          <p><strong>{p.name}</strong> picks up from the airport and drives you to your door in {p.coverage.label}. You book and confirm the price directly with them.</p>
        </>
      )}
      <div className="actions">
        <a className="btn btn-primary" href={p.book} target="_blank" rel="noopener sponsored" data-ev="Partner book" data-ev-target={p.id}>Book with {p.name}</a>
        <Link className="btn btn-ghost" href={partnerHref(p.id)} data-ev="Partner page" data-ev-target={p.id}>Details</Link>
      </div>
    </aside>
  );
}
