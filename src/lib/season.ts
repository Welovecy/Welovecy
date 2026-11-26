/**
 * Places that close for part of the year. Pages stay up all year; a banner and a list label say when they're shut.
 * The date check runs in the visitor's browser (Cyprus time), so static pages never go stale between deploys.
 *
 * closed: months (1-12) when it is shut. opens: the usual opening month, ONLY when a source we cite says so.
 * Waterparks with no published season use November to March, the months every Cyprus waterpark is shut.
 */
export interface Season { closed: number[]; opens?: string; kind: "summer" | "winter" }

const WATERPARK_WINTER = [11, 12, 1, 2, 3];
export const SEASONS: Record<string, Season> = {
  // WaterWorld: "Listed as open April to October" (Cyprus Alive, on the place page)
  "place-waterworld": { closed: WATERPARK_WINTER, opens: "April", kind: "summer" },
  "cy-00287": { closed: WATERPARK_WINTER, opens: "April", kind: "summer" },
  "att-fasouri-watermania": { closed: WATERPARK_WINTER, kind: "summer" },
  "att-aphrodite-waterpark": { closed: WATERPARK_WINTER, kind: "summer" },
  // Skiing: "usually runs from the beginning of January to the end of March" (our ski guide, Cyprus Ski Club)
  "att-troodos-ski": { closed: [4, 5, 6, 7, 8, 9, 10, 11, 12], opens: "January, depending on snow", kind: "winter" },
};

export const seasonFor = (key: string): Season | undefined => SEASONS[key];

/** Month 1-12 in Cyprus right now. */
export function cyMonth(d = new Date()): number {
  return Number(d.toLocaleDateString("en-GB", { month: "numeric", timeZone: "Asia/Nicosia" }));
}
export const isClosed = (s: Season | undefined, month = cyMonth()) => !!s && s.closed.includes(month);

export const SEASON_LABEL = "Closed for the season";
export function seasonLine(s: Season): string {
  if (s.opens) {
    return s.kind === "winter"
      ? `Closed for the season. Skiing usually starts in ${s.opens}. We'll update the date as soon as it's announced.`
      : `Closed for the season. It usually opens in ${s.opens}. We'll update the date as soon as it's announced.`;
  }
  return s.kind === "winter"
    ? "Seasonal and closed for summer. We'll post the opening date as soon as it's announced."
    : "Seasonal and closed for winter. We'll post the opening date as soon as it's announced.";
}
