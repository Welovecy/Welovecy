export const SITE_NAME = "We Love Cyprus";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.welovecy.com").replace(/\/$/, "");
export const absolute = (path: string) => SITE_URL + (path.startsWith("/") ? path : "/" + path);
/** Date the bundled data was last checked against its sources. */
export const DATA_REVIEWED = "2026-11-18";
/** Our Facebook community and Page. */
export const FB_GROUP = "https://www.facebook.com/groups/860311064157221/";
export const FB_PAGE = "https://www.facebook.com/WeLoveCyprusPage";
/** Public email addresses. hello@ for visitors, business@ for venues and partners. */
export const EMAIL_HELLO = "hello@welovecy.com";
export const EMAIL_BUSINESS = "business@welovecy.com";
