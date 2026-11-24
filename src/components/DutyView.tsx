import Link from "next/link";
import { getDest, listingHref } from "@/lib/data";
import { fmtD } from "@/lib/geo";
import { DutyCards, type DutyCard } from "./DutyCards";
import { DUTY_SOURCE, DUTY_TO, addDays, cyToday, daysLeft, dirFor, distancesFor, dutyHours, dutyOn, fmtDay, getDistrict } from "@/lib/duty";

export function dutyCards(district: string, iso: string): DutyCard[] {
  return (dutyOn(district, iso) ?? []).map((x, n) => ({
    key: `${x.am}-${n}`, town: x.te, townGr: x.t, addr: x.a, near: x.near, ph: x.ph,
    href: x.i ? listingHref(x.i) : undefined, dir: dirFor(x), ll: x.ll, approx: !!x.approx,
    dist: distancesFor(x, district).map(({ id, d }) => `${x.approx ? "about " : ""}${fmtD(d)} from ${getDest(id)?.name.split(" &")[0] ?? id}`),
  }));
}

/** Tonight's duty pharmacies for one district, with the hours, the week ahead and what to do after hours. */
export function DutyView({ district }: { district: string }) {
  const D = getDistrict(district)!;
  const today = cyToday();
  const cards = dutyCards(district, today);
  const h = dutyHours(today);
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i + 1)).map((iso) => ({ iso, list: dutyOn(district, iso) }));
  const left = daysLeft(today);
  return (
    <>
      <section className="wrap pad-top" aria-labelledby="h-tonight">
        <p className="eyebrow">{fmtDay(today)}</p>
        <h2 id="h-tonight" style={{ fontSize: 28, marginTop: 4 }}>On duty today in {D.name}</h2>
        <div className="duty-hours"><strong>{h.text}</strong><span className="muted">{h.why}</span></div>
        <p className="tag" style={{ marginBottom: 18 }}>After 22:00, call the duty pharmacy for an urgent prescription. In an emergency call 112 or 199.</p>
        {cards.length ? <DutyCards items={cards} /> : (
          <div className="empty"><p>The official rota for this date hasn&apos;t been published yet. Any pharmacy window shows the duty list, or check the <a href={DUTY_SOURCE} target="_blank" rel="noopener noreferrer">Ministry of Health rota</a>.</p></div>
        )}
      </section>
      {week.some((w) => w.list) ? (
        <section className="wrap" aria-labelledby="h-week">
          <div className="sec-head"><h2 id="h-week">The week ahead</h2></div>
          <div className="g-table" style={{ maxWidth: 760 }}>
            <table className="duty-week">
              <thead><tr><th>Day</th><th>On duty in</th></tr></thead>
              <tbody>
                {week.map((w) => (
                  <tr key={w.iso}>
                    <th scope="row">{fmtDay(w.iso, { weekday: "short", day: "numeric", month: "short" })}</th>
                    <td>{w.list ? w.list.map((x) => x.te).join(", ") : "Not published yet"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
      <section className="wrap" aria-labelledby="h-know">
        <div style={{ maxWidth: 760 }}>
          <h2 id="h-know" style={{ fontSize: 24 }}>Good to know</h2>
          <ul style={{ paddingLeft: 20, display: "grid", gap: 8 }}>
            <li>The rota covers the whole district, so tonight&apos;s pharmacy may be in the next town. Check the drive before you set off.</li>
            <li>Addresses are shown in Greek, as they appear on the street. Show them to a taxi driver, or tap Find on map: the pharmacy whose phone number matches is the one on duty. If in doubt, call.</li>
            <li>Every pharmacy, open or closed, shows the duty list in a lit window by the door.</li>
            <li>Bring your prescription or the generic name of your medicine. <Link href="/guides/pharmacies-on-duty-in-cyprus">More about pharmacies in Cyprus</Link>.</li>
          </ul>
          <p className="tag">
            From the official rota published by the <a href={DUTY_SOURCE} target="_blank" rel="noopener noreferrer">Ministry of Health&apos;s Pharmaceutical Services</a>, covering up to {fmtDay(DUTY_TO, { day: "numeric", month: "long", year: "numeric" })}.
            {left < 21 ? " The next rota is due soon, so double-check any date near the end." : ""} Rotas can change at short notice. If in doubt, call before you go.
          </p>
        </div>
      </section>
    </>
  );
}
