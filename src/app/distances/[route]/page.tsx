import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crumbs } from "@/components/Bits";
import { JsonLd } from "@/components/JsonLd";
import { AIRPORTS, POPULAR, between, fmtMin, idOfSlug, placeName, slugOf } from "@/lib/distances";
import { GUIDES, guideHref } from "@/lib/guides";

export const dynamicParams = false;
export function generateStaticParams() {
  return AIRPORTS.flatMap((a) => POPULAR.map((id) => ({ route: `${a.slug}-to-${slugOf(id)}` })));
}
function parse(route: string) {
  const a = AIRPORTS.find((x) => route.startsWith(x.slug + "-to-"));
  if (!a) return null;
  const id = idOfSlug(route.slice(a.slug.length + 4));
  if (!id) return null;
  const other = AIRPORTS.find((x) => x.id !== a.id)!;
  return { a, other, id, name: placeName(id).replace(" (Kato Paphos)", ""), here: between(a.id, id)!, there: between(other.id, id)! };
}
const GUIDE_FOR: Record<string, string> = {
  "lca:ayianapa": "larnaca-airport-to-ayia-napa-and-protaras", "lca:protaras": "larnaca-airport-to-ayia-napa-and-protaras", "lca:pernera": "larnaca-airport-to-ayia-napa-and-protaras", "lca:kapparis": "larnaca-airport-to-ayia-napa-and-protaras",
  "pfo:paphos": "paphos-airport-to-paphos-and-coral-bay", "pfo:coralbay": "paphos-airport-to-paphos-and-coral-bay",
};

export async function generateMetadata({ params }: { params: Promise<{ route: string }> }): Promise<Metadata> {
  const r = parse((await params).route);
  if (!r) return {};
  return {
    title: `${r.a.name} to ${r.name}: distance and drive time`,
    description: `${r.a.name} to ${r.name} is ${r.here.km} km by road, about ${fmtMin(r.here.min)} by car or taxi. Compare with ${r.other.name} and see how to get there.`,
    alternates: { canonical: `/distances/${(await params).route}` },
  };
}

export default async function RoutePage({ params }: { params: Promise<{ route: string }> }) {
  const r = parse((await params).route);
  if (!r) notFound();
  const closer = r.here.min <= r.there.min;
  const guide = GUIDES.find((g) => g.slug === GUIDE_FOR[`${r.a.id}:${r.id}`]);
  const q = `How far is ${r.name} from ${r.a.name}?`, ans = `${r.here.km} km by road, about ${fmtMin(r.here.min)} by car or taxi in normal traffic.`;
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: ans } }] }} />
      <div className="wrap hero">
        <Crumbs items={[["Home", "/"], ["Distances", "/distances"], [`${r.a.name} to ${r.name}`]]} />
        <h1 className="h-hero" style={{ marginTop: 16 }}>{r.a.name} to {r.name}</h1>
        <div className="dist-big"><div><b>{r.here.km} km</b><span>by road</span></div><div><b>{fmtMin(r.here.min)}</b><span>by car or taxi</span></div></div>
        <p className="lead">
          {closer
            ? `${r.a.name} is the nearer airport for ${r.name}.`
            : `${r.other.name} is nearer: ${r.there.km} km, about ${fmtMin(r.there.min)}. Worth checking flights into both.`}
        </p>
      </div>
      <section className="wrap" aria-label="Getting there">
        <div className="prose g-prose" style={{ maxWidth: 760 }}>
          <h2>Getting there</h2>
          {guide ? <p>For buses, shuttles and taxi fares, read our guide: <Link href={guideHref(guide.slug)}>{guide.title}</Link>.</p> : <p>Taxis wait outside arrivals at both airports, and airport buses run into the nearest town. Ask the driver for the fare before you set off.</p>}
          <h2>Compare</h2>
          <ul>
            <li>{r.a.name}: {r.here.km} km, about {fmtMin(r.here.min)}</li>
            <li>{r.other.name}: {r.there.km} km, about {fmtMin(r.there.min)}</li>
          </ul>
          <p className="muted small">Distances and times are worked out from OpenStreetMap road data, from the centre of {r.name}. Allow more time in summer traffic.</p>
          <p><Link href="/distances">All distances in Cyprus</Link></p>
        </div>
      </section>
    </>
  );
}
