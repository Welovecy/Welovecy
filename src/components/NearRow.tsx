import Link from "next/link";
import { directionsTo, howFar } from "@/lib/geo";
import { KINDS } from "@/lib/kinds";
import type { Near } from "@/lib/around";
import { GoIcon } from "./Icons";

export function NearRow({ n, noDistance, num }: { n: Near; noDistance?: boolean; num?: number }) {
  const K = KINDS[n.s.k];
  const meta = [n.s.sub, noDistance ? "" : (n.s.approx ? "about " : "") + howFar(n.d)].filter(Boolean).join(" · ");
  return (
    <li>
      <Link className="row" href={n.s.href}>
        <span className={`mono k${n.s.k === "bus" ? " k-bus" : ""}`} aria-hidden="true" style={{ background: K.c }}>{num ?? K.l}</span>
        <span className="rowtxt"><strong>{n.s.n}</strong><span>{meta}</span></span>
      </Link>
      <a className="dirlink" href={n.s.dir || directionsTo(n.s.ll)} target="_blank" rel="noopener noreferrer" aria-label={`Directions to ${n.s.n}`}>
        <GoIcon />
      </a>
    </li>
  );
}
