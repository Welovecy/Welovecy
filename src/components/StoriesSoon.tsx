import Link from "next/link";

/** Shown until the first real stories are published. */
export function StoriesSoon({ more }: { more?: boolean }) {
  return (
    <div className="panel" style={{ maxWidth: 760 }}>
      <h3 style={{ fontSize: 22, margin: 0 }}>Stories are on their way.</h3>
      <p style={{ margin: 0 }}>
        We&apos;re researching the people and traditions that make Cyprus what it is: the culture, the crafts and the small businesses behind them. The first stories land soon.
      </p>
      {more ? <p className="small" style={{ margin: 0 }}>Know someone we should meet? Tell us in the <a href="https://www.facebook.com/groups/860311064157221/" target="_blank" rel="noopener noreferrer">We Love Cyprus group</a>.</p> : <p className="small" style={{ margin: 0 }}><Link href="/stories">About our stories</Link></p>}
    </div>
  );
}
