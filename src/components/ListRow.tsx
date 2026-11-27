import Link from "next/link";
import { GoIcon } from "./Icons";
import { SaveButton } from "./SaveButton";
import { SeasonTag } from "./Season";
import { seasonFor, cyMonth } from "@/lib/season";

interface Props {
  href: string; n: string; sub: string; mono: string; color?: string; dir?: string; save?: boolean;
  /** record key (id or place-slug) for seasonal places */
  sk?: string;
}

export function ListRow({ href, n, sub, mono, color, dir, save, sk }: Props) {
  return (
    <li>
      <Link className="row" href={href}>
        <span className={`mono${color ? " k" : ""}`} aria-hidden="true" style={color ? { ["--kc" as string]: color } : undefined}>{mono}</span>
        <span className="rowtxt"><strong>{n}</strong><span>{sub}</span>{sk && seasonFor(sk) ? <SeasonTag k={sk} built={cyMonth()} /> : null}</span>
      </Link>
      {save ? <SaveButton compact item={{ key: href, n, href, sub }} /> : null}
      {dir ? (
        <a className="dirlink" href={dir} target="_blank" rel="noopener noreferrer" aria-label={`Directions to ${n}`}><GoIcon /></a>
      ) : null}
    </li>
  );
}
