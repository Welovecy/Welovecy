import Link from "next/link";
import type { Fact, Source } from "@/lib/types";
import { formatDate } from "@/lib/text";

export function Crumbs({ items }: { items: [string, string?][] }) {
  return (
    <nav aria-label="Breadcrumb" className="crumbs">
      {items.map(([label, href], i) => (
        <span key={i} style={{ display: "contents" }}>
          {i > 0 && <span aria-hidden="true">/</span>}
          {href ? <Link href={href}>{label}</Link> : <span aria-current="page">{label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function Facts({ rows }: { rows: Fact[] }) {
  return (
    <dl className="facts">
      {rows.map(([label, value, unconfirmed], i) => (
        <div key={i}>
          <dt className="label">{label}</dt>
          <dd className={unconfirmed ? "unconfirmed" : undefined}>{unconfirmed ? "Unconfirmed: " : ""}{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Sources({ list, reviewed, title = "Sources" }: { list: Source[]; reviewed?: string; title?: string }) {
  return (
    <div className="sources">
      <p><strong>{title}</strong></p>
      {list.map((s) => (
        <a key={s.u + s.t} href={s.u} target="_blank" rel="noopener noreferrer">{s.t}</a>
      ))}
      <p>Last reviewed: {reviewed ? (/^\d{4}-\d{2}-\d{2}$/.test(reviewed) ? formatDate(reviewed) : reviewed) : "draft, not yet reviewed"}</p>
    </div>
  );
}

export function PageHead({ title, lead, crumbs, children }: { title: string; lead?: string; crumbs: [string, string?][]; children?: React.ReactNode }) {
  return (
    <div className="wrap">
      <Crumbs items={crumbs} />
      <div className="hero-copy">
        <h1 className="h-page">{title}</h1>
        {lead ? <p className="lead">{lead}</p> : null}
        {children}
      </div>
    </div>
  );
}

export function KindDot({ color }: { color: string }) {
  return <span className="kdot" style={{ background: color }} aria-hidden="true" />;
}
