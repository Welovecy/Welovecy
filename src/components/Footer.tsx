import Link from "next/link";

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
          <Link href="/practical#taxi">Taxi fares</Link>
        </div>
        <div>
          <h4>Explore</h4>
          <Link href="/things">Things to do</Link>
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
        <span className="muted">
          Map data ©{" "}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>
        </span>
        <Link href="/credits">Photo credits</Link>
      </div>
    </footer>
  );
}
