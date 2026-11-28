"use client";
import { Analytics } from "@vercel/analytics/next";

/** Page views and events, minus automated browsers (our screenshot and check jobs, and bots that admit to being automated). */
export function SiteAnalytics() {
  return <Analytics beforeSend={(e) => (typeof navigator !== "undefined" && navigator.webdriver ? null : e)} />;
}
