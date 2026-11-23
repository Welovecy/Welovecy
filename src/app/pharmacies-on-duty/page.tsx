import type { Metadata } from "next";
import Link from "next/link";
import { DISTRICTS, cyToday, dutyHours, dutyHref, dutyOn, fmtDay } from "@/lib/duty";
import { PageHead } from "@/components/Bits";

export const revalidate = 600;
export const metadata: Metadata = {
  title: "Pharmacies on duty tonight in Cyprus",
  description: "Which pharmacies are open tonight across Cyprus, by area, from the official Ministry of Health rota. Addresses, phone numbers, directions and today's opening hours.",
  alternates: { canonical: "/pharmacies-on-duty" },
};

export default function DutyIndex() {
  const today = cyToday();
  const h = dutyHours(today);
  return (
    <>
      <PageHead
        title="Pharmacies on duty tonight"
        lead="Choose your area to see today's duty pharmacies, with phone numbers and directions."
        crumbs={[["Home", "/"], ["Essentials", "/essentials"], ["Pharmacies on duty"]]}
      >
        <div className="duty-hours"><span className="eyebrow">{fmtDay(today)}</span><strong>{h.text}</strong></div>
      </PageHead>
      <section className="wrap pad-top">
        <ul className="rows" style={{ maxWidth: 760 }}>
          {DISTRICTS.map((d) => {
            const list = dutyOn(d.id, today) ?? [];
            return (
              <li key={d.id}>
                <Link className="row" href={dutyHref(d.id)}>
                  <span className="mono k" aria-hidden="true" style={{ background: "var(--k-pharm)" }}>+</span>
                  <span className="rowtxt"><strong>{d.name}</strong><span>{list.length ? `${list.length} on duty today: ${[...new Set(list.map((x) => x.te))].join(", ")}` : "Rota not published for today"}</span></span>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="tag" style={{ marginTop: 16, maxWidth: 760 }}>
          From the official Ministry of Health rota. After 22:00, call the duty pharmacy for an urgent prescription. In an emergency call 112 or 199. Staying in the Troodos? Villages fall under Limassol or Nicosia.
        </p>
      </section>
    </>
  );
}
