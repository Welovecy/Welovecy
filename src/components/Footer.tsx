import Link from "next/link";
import { ThemeAuto } from "./ThemeToggle";

export function Footer() {
  return (
    <footer>
      <div className="wrap fcols">
        <div>
          <p className="brand" style={{ marginBottom: 10 }}>We Love Cyprus</p>
          <p className="muted" style={{ fontSize: 15 }}>
            A guide to the Republic of Cyprus, from the island&apos;s largest community.
          </p>
        </div>
        <div>
          <h4>Practical</h4>
          <Link href="/essentials">Pharmacies, clinics and supermarkets</Link>
          <Link href="/practical#emergency">Emergency numbers</Link>
          <Link href="/buses">Buses and airport transfers</Link>
          <Link href="/practical#taxi">Taxi fares</Link>
        </div>
        <div>
          <h4>Explore</h4>
          <Link href="/things">Things to do</Link>
          <Link href="/unesco">UNESCO World Heritage</Link>
          <Link href="/wine">Wine routes</Link>
          <Link href="/stories">Stories</Link>
          <Link href="/about">About</Link>
        </div>
        <div>
          <h4>Businesses</h4>
          <Link href="/list-your-business">List your business</Link>
          <Link href="/list-your-business#update">Suggest an update</Link>
        </div>
      </div>
      <div className="wrap footline">
        <span className="muted">In an emergency call <strong>112</strong> or <strong>199</strong>, free from any phone.</span>
        <Link href="/practical#emergency">All help numbers</Link>
        <Link href="/credits">Photo credits</Link>
        <ThemeAuto />
      </div>
      <div className="wrap footline credits-line">
        <span className="muted">
          Map data ©{" "}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>
          {" · "}Places:{" "}
          <a href="https://docs.overturemaps.org/attribution/" target="_blank" rel="noopener noreferrer">Overture Maps Foundation</a>
          {" · "}Bus routes:{" "}
          <a href="https://www.motionbuscard.org.cy/opendata" target="_blank" rel="noopener noreferrer">Public Works Department via Motion Bus Card</a>{" "}
          (CC BY 4.0, routes with upcoming trips only) · Beaches, pharmacies and businesses from official registers, linked on each page. Bus routes are scheduled, not live.
        </span>
      </div>
    </footer>
  );
}
