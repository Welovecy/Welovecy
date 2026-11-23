import { NextResponse } from "next/server";
import { DEST_CENTRE } from "@/lib/centres";
import type { DestId } from "@/lib/types";
import { parseForecast, type Step } from "@/lib/forecast";

/**
 * Live weather for one area, from MET Norway's Locationforecast (free, CC BY 4.0, credited on the page).
 * Their terms ask for an identifying User-Agent and caching, so results are cached for 30 minutes on our side
 * and at the edge: every visitor shares the same few calls an hour.
 * Optional: set WEATHER_CONTACT in Vercel to a contact address MET Norway can use.
 */
export const dynamic = "force-dynamic";

const UA = `welovecy.com ${process.env.WEATHER_CONTACT ?? "https://welovecy.com"}`;
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const c = DEST_CENTRE[id as DestId];
  if (!c) return NextResponse.json({ error: "unknown area" }, { status: 404 });
  try {
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${c[0].toFixed(3)}&lon=${c[1].toFixed(3)}`;
    const r = await fetch(url, { headers: { "User-Agent": UA }, next: { revalidate: 1800 } });
    if (!r.ok) throw new Error(String(r.status));
    const j = (await r.json()) as { properties: { timeseries: Step[] } };
    const out = parseForecast(j.properties.timeseries, Date.now());
    return NextResponse.json(out, { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } });
  } catch {
    return NextResponse.json({ error: "forecast unavailable" }, { status: 503, headers: { "Cache-Control": "public, s-maxage=120" } });
  }
}
