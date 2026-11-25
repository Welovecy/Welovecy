import type { Metadata } from "next";
import { EventsBrowser, ExploreTabs } from "@/components/Explore";
import { upcoming, weekend } from "@/lib/events";
import { addDays, cyToday } from "@/lib/duty";

export const metadata: Metadata = {
  title: "What's on in Cyprus",
  description: "Events across the Republic of Cyprus: today, this weekend or on your dates, by area. Every listing links to its official source.",
  alternates: { canonical: "/explore/events" },
};
export const revalidate = 3600;

export default function Events() {
  const today = cyToday();
  return (
    <div className="wrap ex">
      <h1 className="ex-h1">Explore Cyprus</h1>
      <ExploreTabs on="events" />
      <EventsBrowser events={upcoming(today)} today={today} wk={weekend(today)} month={addDays(today, 30)} title="Events" />
    </div>
  );
}
