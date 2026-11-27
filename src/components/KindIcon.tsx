import type { AroundKind } from "@/lib/types";
import { KINDS } from "@/lib/kinds";

/** Line glyphs for each kind of place: drawn on a 24px grid, stroke only, so they sit well at any size. */
const D: Partial<Record<AroundKind | "stay", string>> = {
  beach: "M12 3a8 8 0 0 0-8 8h16a8 8 0 0 0-8-8ZM12 11v9M3 21c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1",
  sight: "M4 20h16M5 20V10M9.5 20V10M14.5 20V10M19 20V10M3 10l9-6 9 6Z",
  family: "M12 3a5 5 0 0 1 5 5c0 3.5-5 7-5 7s-5-3.5-5-7a5 5 0 0 1 5-5ZM12 15v6",
  activity: "M3 15c2 0 2-2 4.5-2S10 15 12 15s2.5-2 4.5-2S19 15 21 15M3 19c2 0 2-2 4.5-2S10 19 12 19s2.5-2 4.5-2S19 19 21 19M15 4l3 3-6 4",
  nature: "M12 3l6 9h-4l4 6H6l4-6H6ZM12 18v3",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v6M12 7.5v.5",
  eat: "M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 1.5-3 4-3 7h3v11",
  night: "M5 4h14l-7 8ZM12 12v8M8 20h8",
  stay: "M3 18V7M3 13h18v5M21 18v-3a3 3 0 0 0-3-3h-7v1M7 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  pharmacy: "M12 4v16M4 12h16",
  health: "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z",
  market: "M3 4h2l2.5 11h11L21 7H6.5M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  bus: "M6 17V6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v11ZM6 11h12M8 20v-3M16 20v-3M8.5 14h.01M15.5 14h.01",
  fuel: "M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h12M4 10h10M14 8l3 2v7a1.5 1.5 0 0 0 3 0V9l-3-3",
  carhire: "M5 16V11l2-5h10l2 5v5ZM5 16v3M19 16v3M5 11h14M8 13.5h.01M16 13.5h.01",
};

export function KindIcon({ k, size = 40 }: { k: AroundKind; size?: number }) {
  const K = KINDS[k];
  return (
    <span className="kicon" aria-hidden="true" style={{ ["--kc" as string]: K.c, width: size, height: size }}>
      <svg viewBox="0 0 24 24" width={size * 0.5} height={size * 0.5} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d={D[k] ?? D.info!} />
      </svg>
    </span>
  );
}
