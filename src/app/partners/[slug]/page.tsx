import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Photo } from "@/components/Photo";
import { Sources } from "@/components/Bits";
import { photoFor } from "@/lib/data";
import { guideHref, GUIDES } from "@/lib/guides";
import { PARTNERS, PARTNER_LABEL, getPartner } from "@/lib/partners";

/** Unlisted partner pages: reachable by link and from Aphrodite, kept out of navigation, search and the sitemap. */
export const dynamicParams = false;
export function generateStaticParams() { return PARTNERS.map((p) => ({ slug: p.id })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getPartner((await params).slug);
  return p ? { title: `${p.name}: ${p.kind}`, description: p.intro, robots: { index: false, follow: false } } : {};
}

const SERVICE: Record<string, string> = {
  airport_transfer: "Airport transfers to and from your accommodation",
  local_taxi: "Local taxis around Coral Bay and Peyia",
  car_hire: "Car hire, collected and returned at Larnaca Airport or their Larnaca office",
};

export default async function PartnerPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getPartner((await params).slug);
  if (!p) notFound();
  const photo = p.photo ? photoFor(p.photo) : undefined;
  const guide = GUIDES.find((g) => g.slug === p.guides[0]);
  const tel = (n: string) => `tel:${n.replace(/\s/g, "")}`;
  const contact: [string, React.ReactNode][] = [];
  if (p.phone) contact.push(["Phone", <span key="ph"><a href={tel(p.phone)} data-ev="Partner call" data-ev-target={p.id}>{p.phone}</a>{p.phone2 ? <> or <a href={tel(p.phone2)} data-ev="Partner call" data-ev-target={p.id}>{p.phone2}</a></> : null}</span>]);
  if (p.email) contact.push(["Email", <a key="em" href={`mailto:${p.email}`} data-ev="Partner email" data-ev-target={p.id}>{p.email}</a>]);
  contact.push(["Website", <a key="w" href={p.web} target="_blank" rel="noopener sponsored" data-ev="Partner website" data-ev-target={p.id}>{p.web.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</a>]);
  if (p.hours) contact.push(["Opening hours", p.hours]);
  if (p.address) contact.push([p.address2 ? "Offices" : "Office", p.address2 ? `${p.address}; ${p.address2}` : p.address]);

  return (
    <article className="partner">
      <div className="wrap hero">
        {photo ? <Photo photo={photo} label={p.coverage.label} tint="#5E7C8C" ratio="16/9" priority hero className="hero-photo" /> : null}
        <div className="hero-copy">
          <p className="eyebrow">{PARTNER_LABEL} · We Love Cyprus</p>
          {p.logo ? <img src={p.logo} alt={`${p.name} logo`} className="partner-logo" width={160} height={48} /> : null}
          <h1 className="h-hero">{p.name}</h1>
          <p className="lead">{p.intro}</p>
          <div className="actions">
            <a className="btn btn-primary" href={p.book} target="_blank" rel="noopener sponsored" data-ev="Partner book" data-ev-target={p.id}>{p.services.includes("car_hire") ? "Book a car" : p.book === p.web ? "Book or enquire" : "Book your transfer"}</a>
            {p.phone ? <a className="btn btn-ghost" href={tel(p.phone)} data-ev="Partner call" data-ev-target={p.id}>Call</a> : null}
          </div>
        </div>
      </div>

      <section className="wrap partner-body">
        <div className="partner-cols">
          <div>
            <h2 className="partner-h">Where they cover</h2>
            <p>{p.coverage.label}.</p>
            <ul className="partner-tags">{p.coverage.places.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div>
            <h2 className="partner-h">What they do</h2>
            <ul className="partner-list">{p.services.map((s) => <li key={s}>{SERVICE[s]}</li>)}</ul>
            {p.airports ? <p className="tag">{p.services.includes("car_hire") ? `Collection at ${p.airports.join(" and ")} Airport.` : `From ${p.airports.join(" and ")} airports.`}</p> : null}
          </div>
        </div>

        <h2 className="partner-h">Contact</h2>
        <dl className="facts">{contact.map(([k, v]) => <div key={k}><dt className="label">{k}</dt><dd>{v}</dd></div>)}</dl>

        <p className="partner-note">
          You book, pay and confirm the price directly with {p.name}. We Love Cyprus is paid to feature them and doesn&apos;t take bookings or payments.
          {guide ? <> For every way to get there, including the bus, see <Link href={guideHref(guide.slug)}>{guide.title}</Link>.</> : null}
        </p>
        <Sources list={p.sources} reviewed={`details from their own website, checked ${p.checked ?? "26 November 2026"}`} />
      </section>
    </article>
  );
}
