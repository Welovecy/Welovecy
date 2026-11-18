import type { Metadata } from "next";
import { PageHead } from "@/components/Bits";
import { SavedList } from "@/components/SavedList";

export const metadata: Metadata = { title: "Saved", robots: { index: false } };

export default function Saved() {
  return (
    <>
      <PageHead title="Your Cyprus" crumbs={[["Home", "/"], ["Saved"]]} />
      <section className="wrap pad-top"><SavedList /></section>
    </>
  );
}
