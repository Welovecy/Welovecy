import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BUSINESSES, POIS, bizSub, getBusiness, getPoi, isStay, listingHref, placeForPoi, poiSub } from "@/lib/data";
import { AroundPage } from "@/components/AroundPage";

type P = { params: Promise<{ id: string }> };
export const dynamicParams = true;
export function generateStaticParams() {
  return [...BUSINESSES.filter((b) => b.ll && isStay(b)).map((b) => ({ id: b.i })), ...POIS.filter((r) => r.ll && r.k === "beach" && !placeForPoi(r.i)).map((r) => ({ id: r.i }))];
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const id = decodeURIComponent((await params).id);
  const n = getBusiness(id)?.n || getPoi(id)?.n;
  return n ? { title: `What's around ${n}`, description: `Beaches, sights, food and essentials near ${n}, with walking times and taxi estimates.` } : {};
}

export default async function ListingAround({ params }: P) {
  const id = decodeURIComponent((await params).id);
  const b = getBusiness(id);
  if (b?.ll) {
    const href = listingHref(b.i);
    const stay = isStay(b) ? { id: b.i, n: b.n, ll: b.ll, href, around: `${href}/around`, area: b.d } : undefined;
    return <AroundPage ll={b.ll} name={b.n} sub={bizSub(b)} back={href} skip={b.i} stay={stay} />;
  }
  const r = getPoi(id);
  if (r?.ll) return <AroundPage ll={r.ll} name={r.n} sub={poiSub(r)} back={listingHref(r.i)} skip={r.i} />;
  notFound();
}
