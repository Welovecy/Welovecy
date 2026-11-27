import type { Metadata } from "next";
import Link from "next/link";
import { PageHead, Sources } from "@/components/Bits";

export const metadata: Metadata = { title: "Practical info", description: "Emergency numbers, helplines and urban taxi fares in the Republic of Cyprus." };

const NUMBERS: [string, string, string][] = [
  ["Emergency, any service", "112 or 199", "Police, fire, ambulance"],
  ["Police Citizens' Line", "1460", "Non-emergency, 24 hours"],
  ["Ambulance, direct", "22 887171", ""],
  ["Domestic violence", "1440", ""],
  ["Child and youth helpline", "116 111", ""],
  ["Missing children", "116 000", ""],
];
const TAXI: [string, string, string][] = [
  ["Starting charge", "€3.80", "€4.80"], ["Per km", "€0.95", "€1.10"], ["Waiting, per hour", "€17.00", "€19.00"],
  ["Each piece of luggage", "€1.40", "€1.40"], ["Public holiday supplement", "€2.00", "€2.00"],
];

export default function Practical() {
  return (
    <>
      <PageHead title="Practical info" lead="The numbers and fares worth knowing before you need them." crumbs={[["Home", "/"], ["Practical info"]]}>
        <p className="small" style={{ marginTop: 8 }}><Link href="/know-before-you-go">Know before you go: passports, health cards, heat, drones and more</Link></p>
      </PageHead>
      <section className="wrap pad-top" id="emergency" aria-labelledby="h-em">
        <h2 id="h-em" className="h-sub">Emergency and helplines</h2>
        <div className="numbers">
          {NUMBERS.map(([l, n, s]) => (
            <div key={l} className="num"><span className="label">{l}</span><strong>{n}</strong>{s ? <span className="muted small">{s}</span> : null}</div>
          ))}
        </div>
      </section>
      <section className="wrap" id="taxi" aria-labelledby="h-taxi">
        <h2 id="h-taxi" className="h-sub">Urban taxi fares</h2>
        <div className="tablewrap">
          <table>
            <thead><tr><th scope="col">Charge</th><th scope="col">Day, 06:01 to 20:30</th><th scope="col">Night, 20:31 to 06:00</th></tr></thead>
            <tbody>{TAXI.map(([a, b, c]) => <tr key={a}><td>{a}</td><td>{b}</td><td>{c}</td></tr>)}</tbody>
          </table>
        </div>
        <p className="tag" style={{ marginTop: 12 }}>Taxi estimates on this site start from the day tariff with an allowance for road distance, and go up to 25% more to cover night rates, waiting and detours. Your meter decides the real fare.</p>
        <Sources
          list={[
            { t: "Visit Cyprus: transport and taxi tariffs", u: "https://www.visitcyprus.com/" },
            { t: "Smartraveller: Cyprus", u: "https://www.smartraveller.gov.au/destinations/europe/cyprus" },
            { t: "EU e-Justice: support for victims of crime in Cyprus", u: "https://e-justice.europa.eu/topics/your-rights/victims-crime/victims-rights-country/5-my-rights-support-and-assistance/cy_en" },
          ]}
          reviewed="2026-11-18"
        />
      </section>
    </>
  );
}
