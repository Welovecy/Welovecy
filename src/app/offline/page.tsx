import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Offline", robots: { index: false } };

export default function Offline() {
  return (
    <div className="wrap">
      <div className="hero-copy offline">
        <h1 style={{ fontSize: 48 }}>You&apos;re offline.</h1>
        <p className="lead">Pages you&apos;ve already opened still work. Everything else comes back when you reconnect.</p>
        <p className="muted">In an emergency call <strong>112</strong> or <strong>199</strong>.</p>
        <div className="actions"><Link className="btn btn-primary" href="/saved">Your saved places</Link></div>
      </div>
    </div>
  );
}
