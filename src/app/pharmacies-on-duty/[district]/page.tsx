import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DISTRICTS, cyToday, dutyHref, dutyOn, getDistrict } from "@/lib/duty";
import { PageHead } from "@/components/Bits";
import { DutyView } from "@/components/DutyView";
import { JsonLd } from "@/components/JsonLd";
import { absolute } from "@/lib/site";

type P = { params: Promise<{ district: string }> };
export const dynamicParams = false;
// The page rebuilds itself every 10 minutes, so "today" rolls over shortly after midnight Cyprus time.
export const revalidate = 600;
export function generateStaticParams() { return DISTRICTS.map((d) => ({ district: d.id })); }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const d = getDistrict((await params).district);
  if (!d) return {};
  return {
    title: `Pharmacies on duty tonight in ${d.name}`,
    description: `Which pharmacies are open tonight in ${d.name}, from the official Ministry of Health rota. Addresses, phone numbers, directions and today's opening hours.`,
    alternates: { canonical: dutyHref(d.id) },
  };
}

export default async function DutyDistrict({ params }: P) {
  const d = getDistrict((await params).district);
  if (!d) notFound();
  const list = dutyOn(d.id, cyToday()) ?? [];
  const ld = {
    "@context": "https://schema.org", "@type": "ItemList", name: `Pharmacies on duty today in ${d.name}`,
    itemListElement: list.map((x, i) => ({
      "@type": "ListItem", position: i + 1,
      item: { "@type": "Pharmacy", name: `Pharmacy in ${x.te}`, address: { "@type": "PostalAddress", streetAddress: x.a, addressLocality: x.te, addressCountry: "CY" }, ...(x.ph ? { telephone: `+357${x.ph}` } : {}), ...(x.i ? { url: absolute(`/listing/${x.i}`) } : {}) },
    })),
  };
  return (
    <>
      <JsonLd data={ld} />
      <PageHead title="Pharmacies on duty" crumbs={[["Home", "/"], ["Essentials", "/essentials"], ["Pharmacies on duty", "/pharmacies-on-duty"], [d.short]]}>
        <div className="chips" role="navigation" aria-label="Area">
          {DISTRICTS.map((x) => <Link key={x.id} className="chip stay-chip" href={dutyHref(x.id)} aria-current={x.id === d.id ? "page" : undefined}>{x.name}</Link>)}
        </div>
      </PageHead>
      <DutyView district={d.id} />
    </>
  );
}
