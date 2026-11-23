export const SITE_NAME = "We Love Cyprus";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.welovecy.com").replace(/\/$/, "");
export const absolute = (path: string) => SITE_URL + (path.startsWith("/") ? path : "/" + path);
/** Date the bundled data was last checked against its sources. */
export const DATA_REVIEWED = "2026-11-18";
