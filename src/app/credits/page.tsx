import type { Metadata } from "next";
import { IMAGES } from "@/lib/data";
import { PageHead } from "@/components/Bits";

export const metadata: Metadata = { title: "Photo credits" };

export default function Credits() {
  const seen = new Set<string>();
  const rows = Object.values(IMAGES).filter((i) => (seen.has(i.u) ? false : (seen.add(i.u), true)));
  return (
    <>
      <PageHead title="Photo credits" lead="Some photography comes from Wikimedia Commons under free licences, until our own shoots replace it." crumbs={[["Home", "/"], ["Photo credits"]]} />
      <section className="wrap pad-top">
        <div className="tablewrap">
          <table>
            <thead><tr><th scope="col">Photo</th><th scope="col">Author</th><th scope="col">Licence</th></tr></thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.u}><td>{i.p ? <a href={i.p} target="_blank" rel="noopener noreferrer">{i.t}</a> : i.t}</td><td>{i.a}</td><td>{i.l}</td></tr>
              ))}
              <tr><td>Aphrodite&apos;s Rock at sunset</td><td>Supplied by We Love Cyprus</td><td></td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
