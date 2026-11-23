import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

/**
 * Guides are Markdown files in /content/guides. Front matter:
 *   title, description, date, updated, topic, image (an images.json key), quick (short answers shown first),
 *   cta { text, href }, sources [{ t, u }], related [slugs]
 */
export interface Guide {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated: string;
  topic: string;
  image?: string;
  quick: string[];
  cta?: { text: string; href: string };
  sources: { t: string; u: string }[];
  related: string[];
  html: string;
  minutes: number;
}

const DIR = path.join(process.cwd(), "content", "guides");

marked.use({
  gfm: true,
  renderer: {
    // outside links open in a new tab; site links stay in the app
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const ext = /^https?:\/\//.test(href);
      return `<a href="${href}"${title ? ` title="${title}"` : ""}${ext ? ' target="_blank" rel="noopener noreferrer"' : ""}>${text}</a>`;
    },
    // wide tables scroll inside their own box on phones
    table(token) {
      const head = token.header.map((c) => `<th>${this.parser.parseInline(c.tokens)}</th>`).join("");
      const body = token.rows.map((r) => `<tr>${r.map((c) => `<td>${this.parser.parseInline(c.tokens)}</td>`).join("")}</tr>`).join("");
      return `<div class="g-table"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
    },
  },
});

function load(): Guide[] {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR).filter((f) => f.endsWith(".md")).map((f) => {
    const { data, content } = matter(fs.readFileSync(path.join(DIR, f), "utf8"));
    const words = content.split(/\s+/).length;
    return {
      slug: f.replace(/\.md$/, ""),
      title: data.title,
      description: data.description,
      date: String(data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date),
      updated: String(data.updated instanceof Date ? data.updated.toISOString().slice(0, 10) : data.updated ?? data.date),
      topic: data.topic ?? "Guides",
      image: data.image,
      quick: data.quick ?? [],
      cta: data.cta,
      sources: data.sources ?? [],
      related: data.related ?? [],
      html: marked.parse(content, { async: false }) as string,
      minutes: Math.max(2, Math.round(words / 220)),
    } satisfies Guide;
  }).sort((a, b) => b.date.localeCompare(a.date));
}

export const GUIDES = load();
export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);
export const guideHref = (slug: string) => `/guides/${slug}`;
