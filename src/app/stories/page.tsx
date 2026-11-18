import type { Metadata } from "next";
import { EXPERIENCES } from "@/lib/data";
import { PageHead } from "@/components/Bits";
import { ExperienceCard } from "@/components/Cards";

export const metadata: Metadata = { title: "Stories", description: "The makers, growers and hosts who give each place its character." };

export default function Stories() {
  return (
    <>
      <PageHead title="Stories" lead="The makers, growers and hosts who give each place its character." crumbs={[["Home", "/"], ["Stories"]]} />
      <section className="wrap pad-top"><div className="grid-3">{EXPERIENCES.map((e) => <ExperienceCard key={e.slug} e={e} />)}</div></section>
    </>
  );
}
