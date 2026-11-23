import type { Metadata } from "next";
import { DESTINATIONS } from "@/lib/data";
import { Crumbs } from "@/components/Bits";
import { WeatherNow } from "@/components/Weather";
import { MonthPicker } from "@/components/MonthPicker";
import { CLIMATE_SOURCE } from "@/lib/weather";

export const metadata: Metadata = {
  title: "Weather in Cyprus, now and by month",
  description: "Live weather for every area of Cyprus, plus what to expect each month: day and night temperatures, sea temperature, rain and sunshine.",
};

export default function WeatherPage() {
  const areas = DESTINATIONS.map((d) => ({ id: d.id, name: d.name }));
  return (
    <>
      <div className="wrap hero">
        <Crumbs items={[["Home", "/"], ["Weather"]]} />
        <h1 className="h-hero" style={{ marginTop: 16 }}>Weather</h1>
        <p className="lead">What it&rsquo;s like right now, and what to expect when you&rsquo;re here.</p>
      </div>
      <section className="wrap" aria-labelledby="h-when">
        <div className="sec-head"><h2 id="h-when">When are you coming?</h2></div>
        <MonthPicker areas={areas} />
        <p className="muted small" style={{ marginTop: 16 }}>Air temperature, rain and sunshine are long-term averages from the Cyprus Department of Meteorology; sea temperatures are approximate (weather2travel). Source: <a href={CLIMATE_SOURCE.u} target="_blank" rel="noopener noreferrer">Climate of Cyprus</a>, checked {CLIMATE_SOURCE.checked}.</p>
      </section>
      <section className="wrap" aria-labelledby="h-now">
        <div className="sec-head"><h2 id="h-now">Right now</h2></div>
        <div className="wx-grid">
          {areas.map((a) => (
            <a key={a.id} className="wx-card" href={`/destinations/${a.id}#s-weather`}>
              <strong>{a.name}</strong>
              <WeatherNow d={a.id} name={a.name} compact />
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
