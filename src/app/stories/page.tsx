import type { Metadata } from "next";
import { EXPERIENCES } from "@/lib/data";
import { PageHead } from "@/components/Bits";
import { ExperienceCard } from "@/components/Cards";
import { StoriesSoon } from "@/components/StoriesSoon";

export const metadata: Metadata = { title: "Stories", description: "The people, traditions and small businesses that give Cyprus its character." };

export default function Stories() {
  return (
    <>
      <PageHead title="Stories" lead="The people, traditions and small businesses that give Cyprus its character." crumbs={[["Home", "/"], ["Stories"]]} />
      <section className="wrap pad-top">{EXPERIENCES.length ? <div className="grid-3">{EXPERIENCES.map((e) => <ExperienceCard key={e.slug} e={e} />)}</div> : <StoriesSoon more />}</section>
    </>
  );
}
