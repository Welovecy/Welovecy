import Link from "next/link";
import { GoIcon } from "./Icons";
import { SaveButton } from "./SaveButton";

interface Props {
  href: string; n: string; sub: string; mono: string; color?: string; dir?: string; save?: boolean;
}

export function ListRow({ href, n, sub, mono, color, dir, save }: Props) {
  return (
    <li>
      <Link className="row" href={href}>
        <span className={`mono${color ? " k" : ""}`} aria-hidden="true" style={color ? { background: color } : undefined}>{mono}</span>
        <span className="rowtxt"><strong>{n}</strong><span>{sub}</span></span>
      </Link>
      {save ? <SaveButton compact item={{ key: href, n, href, sub }} /> : null}
      {dir ? (
        <a className="dirlink" href={dir} target="_blank" rel="noopener noreferrer" aria-label={`Directions to ${n}`}><GoIcon /></a>
      ) : null}
    </li>
  );
}
