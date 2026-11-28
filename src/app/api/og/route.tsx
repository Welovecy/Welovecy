import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ogFor } from "@/lib/og";
import { ISLAND_PATH, ISLAND_W, ISLAND_H, toMap } from "@/lib/island";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

const W = 1200, H = 630;
let fonts: Promise<{ name: string; data: Buffer; weight: 600 | 700; style: "normal" }[]> | null = null;
const loadFonts = () =>
  (fonts ??= Promise.all([
    readFile(join(process.cwd(), "src/app/api/og/fonts/InterTight-700.woff")).then((data) => ({ name: "Head", data, weight: 700 as const, style: "normal" as const })),
    readFile(join(process.cwd(), "src/app/api/og/fonts/Inter-600.woff")).then((data) => ({ name: "Body", data, weight: 600 as const, style: "normal" as const })),
  ]));

/** Fetch a photo as a data URI (JPEG or PNG only; the renderer can't draw WebP). Any failure → no photo. */
async function photo(u: string | undefined, origin: string): Promise<string | undefined> {
  if (!u) return undefined;
  const url = u.startsWith("/") ? origin + u : u;
  try {
    const r = await fetch(url, { headers: { "User-Agent": "welovecy.com share image (welovecy@users.noreply.github.com)" }, signal: AbortSignal.timeout(6000) });
    const type = r.headers.get("content-type") ?? "";
    if (!r.ok || !/image\/(jpeg|png)/.test(type)) return undefined;
    return `data:${type};base64,${Buffer.from(await r.arrayBuffer()).toString("base64")}`;
  } catch { return undefined; }
}

const Logo = () => (
  <svg width="46" height="46" viewBox="80 90 340 370">
    <path d="M256 310 C 200 272, 136 230, 136 166 C 136 124, 168 94, 206 94 C 230 94, 248 108, 256 128 C 264 108, 282 94, 306 94 C 344 94, 376 124, 376 166 C 376 230, 312 272, 256 310 Z" fill="#F0A23B" />
    <path d="M84 404 C 110 370, 140 356, 170 384 C 200 414, 220 444, 244 444 C 268 444, 290 414, 318 384 C 346 356, 376 370, 404 404" fill="none" stroke="#9DB36A" strokeWidth="34" strokeLinecap="round" />
  </svg>
);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const card = ogFor(url.searchParams.get("p") ?? "/");
  const origin = process.env.NODE_ENV === "production" ? SITE_URL : url.origin;
  const [img, fnt] = await Promise.all([photo(card.img, origin), loadFonts()]);
  const size = card.title.length > 34 ? 64 : card.title.length > 22 ? 76 : 88;
  const pin = card.ll ? toMap(card.ll) : null;

  return new ImageResponse(
    (
      <div style={{ width: W, height: H, display: "flex", position: "relative", fontFamily: "Body", color: "#fff", background: `linear-gradient(135deg, ${card.tint} 0%, #0F1B24 100%)` }}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" width={W} height={H} style={{ position: "absolute", inset: 0, width: W, height: H, objectFit: "cover" }} />
        ) : (
          <svg width="620" height={Math.round((620 * ISLAND_H) / ISLAND_W)} viewBox={`0 0 ${ISLAND_W} ${ISLAND_H}`} style={{ position: "absolute", right: 40, top: 70, opacity: 0.95 }}>
            <path d={ISLAND_PATH} fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.45)" strokeWidth="0.5" />
            {pin ? <circle cx={pin[0]} cy={pin[1]} r="6" fill="rgba(240,162,59,0.25)" /> : null}
            {pin ? <circle cx={pin[0]} cy={pin[1]} r="2.4" fill="#F0A23B" stroke="#fff" strokeWidth="0.8" /> : null}
          </svg>
        )}
        <div style={{ position: "absolute", inset: 0, display: "flex", background: img ? "linear-gradient(180deg, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0.05) 45%, rgba(0,0,0,0.72) 100%)" : "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%)" }} />
        <div style={{ position: "absolute", top: 44, left: 56, display: "flex", alignItems: "center", gap: 14 }}>
          <Logo />
          <span style={{ fontFamily: "Head", fontSize: 34, letterSpacing: -1 }}>We Love Cyprus</span>
        </div>
        <div style={{ position: "absolute", left: 56, right: 56, bottom: 52, display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 24, letterSpacing: 2, textTransform: "uppercase", opacity: 0.92 }}>{card.eyebrow}</span>
          <span style={{ fontFamily: "Head", fontSize: size, lineHeight: 1.02, letterSpacing: -2.5, marginTop: 10, maxWidth: 1000 }}>{card.title}</span>
          {card.chips.length ? (
            <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
              {card.chips.map((c) => <span key={c} style={{ fontSize: 24, padding: "8px 20px", borderRadius: 999, background: "rgba(255,255,255,0.20)", border: "1px solid rgba(255,255,255,0.35)" }}>{c}</span>)}
            </div>
          ) : null}
        </div>
      </div>
    ),
    {
      width: W, height: H, fonts: fnt,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400" },
    },
  );
}
