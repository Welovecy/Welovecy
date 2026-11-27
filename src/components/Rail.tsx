import Link from "next/link";

export interface RailItem { href: string; img?: string; alt?: string; title: string; sub?: string; badge?: string; tint?: string }

/** A row of tall photo cards you swipe through. One section of a page, never a wall of cards. */
export function Rail({ id, title, more, items, tall }: { id: string; title: string; more?: [string, string]; items: RailItem[]; tall?: boolean }) {
  if (!items.length) return null;
  return (
    <section className="wrap rail-sec" aria-labelledby={`h-${id}`}>
      <div className="dsec-row">
        <h2 id={`h-${id}`} className="dsec-h">{title}</h2>
        {more ? <Link href={more[1]} className="dlink">{more[0]} <span aria-hidden="true">›</span></Link> : null}
      </div>
      <div className={`bx-rail${tall ? " rail-tall" : ""}`}>
        {items.map((it) => (
          <Link key={it.href} href={it.href} className="bx-pic" style={it.img ? undefined : { background: it.tint ?? "#2E6E8E" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {it.img ? <img src={it.img} alt={it.alt ?? it.title} loading="lazy" decoding="async" /> : null}
            <span className="bx-pic-txt">
              {it.badge ? <em>{it.badge}</em> : null}
              <b>{it.title}</b>
              {it.sub ? <small>{it.sub}</small> : null}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Commons photos come in set widths; cards need about 500px. */
export const cardImg = (u?: string) => (u && /\/\d+px-/.test(u) ? u.replace(/\/\d+px-/, "/500px-") : u);
