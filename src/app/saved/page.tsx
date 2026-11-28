import type { Metadata } from "next";
import { BUSINESSES, PLACES, POIS, listingHref, photoFor, placeHref, placeKind } from "@/lib/data";
import { SavedList, type SavedMeta } from "@/components/SavedList";

export const metadata: Metadata = { title: "Saved", robots: { index: false } };

const thumb = (u?: string) => (u && /\/\d+px-/.test(u) ? u.replace(/\/\d+px-/, "/330px-") : u);

/** A photo and a kind for everything that can be saved and has a photo, so the list looks like the places it holds. */
function savedMeta(): SavedMeta {
  const m: SavedMeta = {};
  for (const p of PLACES) m[placeHref(p.slug)] = [thumb(photoFor(`place-${p.slug}`)?.u), placeKind(p)];
  for (const r of POIS) {
    const ph = photoFor(r.k === "beach" ? `beach-${r.i}` : `poi-${r.i}`);
    if (ph) m[listingHref(r.i)] = [thumb(ph.u), r.k];
  }
  for (const b of BUSINESSES) {
    const ph = photoFor(`biz-${b.i}`);
    if (ph) m[listingHref(b.i)] = [thumb(ph.u), b.g === "hotel" || b.g === "apart" ? "stay" : "eat"];
  }
  return m;
}

export default function Saved() {
  const empty = ["place-nissi", "place-cape-greco", "place-kourion"].map((k) => thumb(photoFor(k)?.u)).filter((u): u is string => !!u);
  return <SavedList meta={savedMeta()} emptyPics={empty} />;
}
