import type { Metadata } from "next";
import { EventCard, EventsBrowser, ExploreTabs } from "@/components/Explore";
import { FESTIVAL_TYPES, datesTbc, upcoming, weekend } from "@/lib/events";
import { addDays, cyToday } from "@/lib/duty";

export const metadata: Metadata = {
  title: "Festivals in Cyprus",
  description: "Cypriot festivals, carnival, Easter, Kataklysmos, wine festivals and Christmas markets, with dates from official sources.",
  alternates: { canonical: "/explore/festivals" },
};
export const revalidate = 3600;

export default function Festivals() {
  const today = cyToday();
  const tbc = datesTbc().filter((e) => FESTIVAL_TYPES.includes(e.type));
  return (
    <div className="wrap ex">
      <h1 className="ex-h1">Explore Cyprus</h1>
      <ExploreTabs on="festivals" />
      <EventsBrowser events={upcoming(today)} types={FESTIVAL_TYPES} today={today} wk={weekend(today)} month={addDays(today, 30)} title="Festivals" />
      {tbc.length ? (
        <section className="ex-sec" aria-labelledby="h-tbc">
          <div className="ex-sec-head"><h2 id="h-tbc">Dates coming soon</h2></div>
          <div className="ex-list">{tbc.map((e) => <EventCard key={e.id} e={e} />)}</div>
        </section>
      ) : null}
    </div>
  );
}
