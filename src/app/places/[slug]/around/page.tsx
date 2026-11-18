import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PLACES, getPlace, placeHref } from "@/lib/data";
import { AroundPage } from "@/components/AroundPage";

export const dynamicParams = false;
export function generateStaticParams() { return PLACES.filter((p) => p.ll).map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getPlace((await params).slug);
  return p ? { title: `What's around ${p.name}`, description: `Beaches, sights, food and essentials near ${p.name}, with distances.` } : {};
}

export default async function PlaceAround({ params }: { params: Promise<{ slug: string }> }) {
  const p = getPlace((await params).slug);
  if (!p || !p.ll) notFound();
  return <AroundPage ll={p.ll} name={p.name} sub={p.cat} back={placeHref(p.slug)} skip={`place-${p.slug}`} />;
}
