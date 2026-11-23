import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crumbs } from "@/components/Bits";
import { Photo } from "@/components/Photo";
import { JsonLd } from "@/components/JsonLd";
import { ShareButton } from "@/components/ShareButton";
import { GUIDES, getGuide, guideHref } from "@/lib/guides";
import { photoFor } from "@/lib/data";
import { absolute, SITE_NAME } from "@/lib/site";
import { formatDate } from "@/lib/text";

export const dynamicParams = false;
export function generateStaticParams() { return GUIDES.map((g) => ({ slug: g.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = getGuide((await params).slug);
  if (!g) return {};
  const img = g.image ? photoFor(g.image) : undefined;
  return {
    title: g.title, description: g.description, alternates: { canonical: guideHref(g.slug) },
    openGraph: { type: "article", title: g.title, description: g.description, publishedTime: g.date, modifiedTime: g.updated, ...(img ? { images: [img.u] } : {}) },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = getGuide((await params).slug);
  if (!g) notFound();
  const img = g.image ? photoFor(g.image) : undefined;
  const related = g.related.map(getGuide).filter(Boolean).slice(0, 3);
  const ld = {
    "@context": "https://schema.org", "@type": "Article", headline: g.title, description: g.description,
    datePublished: g.date, dateModified: g.updated, mainEntityOfPage: absolute(guideHref(g.slug)),
    ...(img ? { image: [img.u] } : {}),
    author: { "@type": "Organization", name: SITE_NAME, url: absolute("/") },
    publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: absolute("/icons/icon-512.png") } },
  };
  return (
    <article>
      <JsonLd data={ld} />
      <div className="wrap hero g-head">
        <Crumbs items={[["Home", "/"], ["Guides", "/guides"], [g.title]]} />
        <p className="eyebrow" style={{ marginTop: 20 }}>{g.topic}</p>
        <h1 className="h-hero g-title">{g.title}</h1>
        <p className="lead">{g.description}</p>
        <p className="muted small g-meta">Updated {formatDate(g.updated)} · {g.minutes} min read · Facts checked against official sources</p>
        <div className="actions"><ShareButton title={g.title} /></div>
      </div>
      {img ? <div className="wrap"><Photo photo={img} label={g.title} tint="#7E8EA0" ratio="21/9" priority hero className="g-photo" /></div> : null}
      <div className="wrap g-body">
        {g.quick.length ? (
          <aside className="g-quick" aria-label="Quick answer">
            <p className="eyebrow">Quick answer</p>
            <ul>{g.quick.map((q, i) => <li key={i}>{q}</li>)}</ul>
          </aside>
        ) : null}
        <div className="prose g-prose" dangerouslySetInnerHTML={{ __html: g.html }} />
        {g.cta ? <p className="g-cta"><Link className="btn btn-primary" href={g.cta.href}>{g.cta.text}</Link></p> : null}
        {g.sources.length ? (
          <div className="sources">
            <strong>Sources, checked {formatDate(g.updated)}</strong>
            {g.sources.map((s) => <a key={s.u} href={s.u} target="_blank" rel="noopener noreferrer">{s.t}</a>)}
            <span>Times, fares and routes change. Check with the operator before you travel.</span>
          </div>
        ) : null}
      </div>
      {related.length ? (
        <section className="wrap" aria-labelledby="h-rel">
          <div className="sec-head"><h2 id="h-rel">Read next</h2></div>
          <ul className="g-rel">{related.map((r) => <li key={r!.slug}><Link href={guideHref(r!.slug)}><strong>{r!.title}</strong><span>{r!.description}</span></Link></li>)}</ul>
        </section>
      ) : null}
    </article>
  );
}
