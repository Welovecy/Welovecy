import Link from "next/link";
import type { Destination, Experience, Maker, Place } from "@/lib/types";
import { getDest, getExperience, getMaker, getPlace, photoFor, placeHref } from "@/lib/data";
import { Photo } from "./Photo";
import { SaveButton } from "./SaveButton";
import { DistanceTag } from "./FromBase";

export function DestCard({ d, feature }: { d: Destination; feature?: boolean }) {
  return (
    <Link className={`card${feature ? " feature" : ""}`} href={`/destinations/${d.id}`}>
      <Photo photo={photoFor(`dest-${d.id}`)} label={d.name} tint={d.tint} ratio="4/5" />
      <div>
        <h3>{d.name}</h3>
        <p className="mt6">{d.line}</p>
        {d.live ? null : <p className="muted mt6 small">Chapter in progress</p>}
      </div>
    </Link>
  );
}

export function PlaceCard({ p, why }: { p: Place; why?: string }) {
  const d = getDest(p.dest);
  return (
    <div className="card">
      <Link href={placeHref(p.slug)} className="card-link">
        <Photo photo={photoFor(`place-${p.slug}`)} label={p.name} tint={p.tint} ratio="4/3" />
        <div>
          <p className="eyebrow">{d?.name}</p>
          <h3 className="mt4">{p.name}</h3>
          <p className="mt6">{why || p.intro}</p>
          <DistanceTag ll={p.ll} />
        </div>
      </Link>
      <div><SaveButton item={{ key: placeHref(p.slug), n: p.name, href: placeHref(p.slug), sub: `${p.cat} · ${d?.name ?? ""}` }} /></div>
    </div>
  );
}

export function ExperienceCard({ e }: { e: Experience }) {
  const href = `/experiences/${e.slug}`;
  return (
    <div className="card">
      <Link href={href} className="card-link">
        <Photo photo={photoFor(`exp-${e.slug}`)} label="A maker at work" tint={e.tint} ratio="4/3" />
        <div>
          <p className="eyebrow">Craft experience</p>
          <h3 className="mt4">{e.name}</h3>
          <p className="mt6">{e.intro}</p>
          {e.sample ? <p className="mt8"><span className="flag">Sample</span></p> : null}
        </div>
      </Link>
      <div><SaveButton item={{ key: href, n: e.name, href, sub: "Craft experience" }} /></div>
    </div>
  );
}

export function MakerCard({ m }: { m: Maker }) {
  const href = `/makers/${m.slug}`;
  return (
    <div className="card">
      <Link href={href} className="card-link">
        <Photo photo={photoFor(`biz-${m.slug}`)} label="Workshop" tint={m.tint} ratio="3/2" />
        <div>
          <h3>{m.name}</h3>
          <p className="mt4">{m.cat} · {m.locality}</p>
          <p className="mt6">{m.line}</p>
          {m.sample ? <p className="mt8"><span className="flag">Sample listing</span></p> : null}
        </div>
      </Link>
      <div><SaveButton item={{ key: href, n: m.name, href, sub: m.cat }} /></div>
    </div>
  );
}

export function NearbyCards({ keys }: { keys: string[] }) {
  return (
    <>
      {keys.map((k) => <NearbyCard key={k} k={k} />)}
    </>
  );
}

function NearbyCard({ k }: { k: string }) {
  if (k.startsWith("place-")) { const p = getPlace(k.slice(6)); return p ? <PlaceCard p={p} /> : null; }
  if (k.startsWith("exp-")) { const e = getExperience(k.slice(4)); return e ? <ExperienceCard e={e} /> : null; }
  if (k.startsWith("biz-")) { const m = getMaker(k.slice(4)); return m ? <MakerCard m={m} /> : null; }
  return null;
}

export function FeaturedBlock({ destName }: { destName: string }) {
  return (
    <section className="wrap" id="featured" aria-labelledby="h-featured">
      <div className="sec-head"><h2 id="h-featured">Featured in {destName}</h2></div>
      <div className="grid-3">
        {["Places to stay", "Experiences", "Eat & drink"].map((t) => (
          <div key={t} className="featured">
            <span className="flag" style={{ justifySelf: "start" }}>Featured spot</span>
            <h3 style={{ fontSize: 20 }}>{t}</h3>
            <p className="muted small">Local partners appear here, always marked as featured. Our must-see picks are never paid for.</p>
            <Link href="/list-your-business">Feature your business</Link>
          </div>
        ))}
      </div>
    </section>
  );
}
