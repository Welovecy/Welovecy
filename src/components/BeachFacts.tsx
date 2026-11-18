import type { Fact, Poi } from "@/lib/types";
import { Facts } from "./Bits";
import { formatDate } from "@/lib/text";

export function beachFacts(r: Poi): Fact[] {
  const f: Fact[] = [];
  if (r.sf) f.push(["Shore", r.sf, false]);
  f.push(["Blue Flag", r.bf ? "Yes, Blue Flag 2026" : "Not listed as Blue Flag", false]);
  if (r.fac?.length) f.push(["Facilities", r.fac.join(", "), false]);
  if (r.acc) f.push(["Getting there", r.acc, false]);
  if (r.alt) f.push(["Also known as", r.alt.split(";").map((s) => s.trim()).filter((s) => !/[Ͱ-Ͽ]/.test(s)).join(", ") || r.alt, false]);
  return f;
}

export function BeachFacts({ r }: { r: Poi }) {
  return (
    <>
      <h2>Beach facts</h2>
      <Facts rows={beachFacts(r)} />
      {r.bf ? <p><span className="flag flag-accent">Blue Flag 2026</span></p> : null}
    </>
  );
}

export function BeachSources({ r }: { r: Poi }) {
  return (
    <div className="sources">
      <p><strong>Beach sources</strong></p>
      {r.info ? <a href={r.info} target="_blank" rel="noopener noreferrer">Official beach page</a> : null}
      {r.bw ? <a href={r.bw} target="_blank" rel="noopener noreferrer">Bathing water profile (Department of Environment)</a> : null}
      {r.su && r.su !== r.info ? <a href={r.su} target="_blank" rel="noopener noreferrer">Source listing</a> : null}
      <p>Last reviewed: retrieved {formatDate(r.sd) || "18 November 2026"} from official and OpenStreetMap sources. Facilities can change by season.</p>
    </div>
  );
}
