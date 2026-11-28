import Link from "next/link";
import { GoIcon } from "./Icons";
import { SaveButton } from "./SaveButton";
import { SeasonTag } from "./Season";
import { seasonFor, cyMonth } from "@/lib/season";
import { KindIcon } from "./KindIcon";
import type { AroundKind } from "@/lib/types";

interface Props {
  href: string; n: string; sub: string; mono: string; color?: string; dir?: string; save?: boolean;
  /** record key (id or place-slug) for seasonal places */
  sk?: string;
  /** kind of place, drawn as an icon when there's no photo */
  k?: AroundKind;
  /** small photo */
  img?: string;
}

export function ListRow({ href, n, sub, mono, color, dir, save, sk, k, img }: Props) {
  return (
    <li>
      <Link className="row" href={href}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="row-img" src={img} alt="" loading="lazy" decoding="async" width={52} height={52} />
        ) : k ? <KindIcon k={k} size={44} /> : <span className={`mono${color ? " k" : ""}`} aria-hidden="true" style={color ? { ["--kc" as string]: color } : undefined}>{mono}</span>}
        <span className="rowtxt"><strong>{n}</strong><span>{sub}</span>{sk && seasonFor(sk) ? <SeasonTag k={sk} built={cyMonth()} /> : null}</span>
      </Link>
      {save ? <SaveButton compact item={{ key: href, n, href, sub }} /> : null}
      {dir ? (
        <a className="dirlink" href={dir} target="_blank" rel="noopener noreferrer" aria-label={`Directions to ${n}`}><GoIcon /></a>
      ) : null}
    </li>
  );
}
