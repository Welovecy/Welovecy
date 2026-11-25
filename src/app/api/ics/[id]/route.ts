import { EVENTS, ics } from "@/lib/events";

/** "Add to calendar": a one-event .ics file that iPhone and Android calendars open directly. */
export const dynamic = "force-static";
export function generateStaticParams() { return EVENTS.filter((e) => e.start).map((e) => ({ id: e.id })); }

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const e = EVENTS.find((x) => x.id === id);
  if (!e?.start) return new Response("Not found", { status: 404 });
  return new Response(ics(e), { headers: { "content-type": "text/calendar; charset=utf-8", "content-disposition": `inline; filename="${e.id}.ics"` } });
}
