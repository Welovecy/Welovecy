import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap">
      <div className="hero-copy">
        <h1 style={{ fontSize: 56 }}>Page not found</h1>
        <p className="lead">That link doesn&apos;t lead anywhere yet.</p>
        <div className="actions"><Link className="btn btn-primary" href="/">Go home</Link><Link className="btn btn-ghost" href="/search">Search</Link></div>
      </div>
    </div>
  );
}
