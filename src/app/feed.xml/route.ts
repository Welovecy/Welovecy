import { GUIDES, guideHref } from "@/lib/guides";
import { photoFor } from "@/lib/data";
import { SITE_NAME, absolute } from "@/lib/site";

/**
 * RSS of our guides, newest first. Make.com (or any RSS-to-Facebook tool) watches this
 * and posts each new guide to the We Love Cyprus Page.
 */
export const dynamic = "force-static";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!);

export function GET() {
  const items = GUIDES.map((g) => {
    const url = absolute(guideHref(g.slug));
    const img = g.image ? photoFor(g.image) : undefined;
    const imgUrl = img ? (img.u.startsWith("http") ? img.u : absolute(img.u)) : undefined;
    return `    <item>
      <title>${esc(g.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(g.date + "T08:00:00Z").toUTCString()}</pubDate>
      <category>${esc(g.topic)}</category>
      <description>${esc(g.description)}</description>${imgUrl ? `\n      <enclosure url="${esc(imgUrl)}" type="image/jpeg" length="0" />` : ""}
    </item>`;
  }).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_NAME)}: guides</title>
    <link>${absolute("/guides")}</link>
    <atom:link href="${absolute("/feed.xml")}" rel="self" type="application/rss+xml" />
    <description>Straight answers for your Cyprus trip, checked against official sources.</description>
    <language>en-gb</language>
${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=3600" } });
}
