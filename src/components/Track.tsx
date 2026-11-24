"use client";
import { useEffect } from "react";
import { track } from "@vercel/analytics";

/**
 * Counts the taps that show how the site is used: calls, map links, bookings, the Facebook group.
 * Nothing personal: just which button, on which page. Works without cookies.
 */
function classify(el: HTMLElement): [string, string] | null {
  const own = el.dataset.ev;
  if (own) return [own, el.dataset.evTarget || el.textContent?.trim().slice(0, 60) || ""];
  const a = el.closest("a") as HTMLAnchorElement | null;
  const label = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60);
  if (!a) {
    if (/staying here/i.test(label)) return ["Staying here", ""];
    return null;
  }
  const href = a.getAttribute("href") || "";
  if (href.startsWith("tel:")) return ["Call", href.slice(4)];
  if (href.startsWith("mailto:")) return ["Email", href.slice(7)];
  if (!/^https?:/i.test(href)) return null;
  const u = new URL(href);
  if (/google\.[a-z.]+$/.test(u.hostname) && u.pathname.startsWith("/maps")) return ["Map", label || "map"];
  if (/facebook\.com$/.test(u.hostname)) return ["Facebook", u.pathname.includes("/groups/") ? "group" : "page"];
  if (u.hostname.endsWith("welovecy.com")) return null;
  return ["Outbound", u.hostname.replace(/^www\./, "")];
}

export function Track() {
  useEffect(() => {
    const on = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest("a,button,[data-ev]") as HTMLElement | null;
      if (!el) return;
      const c = classify(el);
      if (!c) return;
      try { track(c[0], { page: location.pathname.slice(0, 100), target: c[1] }); } catch {}
    };
    document.addEventListener("click", on, { capture: true });
    return () => document.removeEventListener("click", on, { capture: true });
  }, []);
  return null;
}
