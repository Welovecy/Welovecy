"use client";
import { useEffect, useState } from "react";
import { SEASON_LABEL, cyMonth, isClosed, seasonFor, seasonLine } from "@/lib/season";

/** The month is checked again in the browser, so a page built in March still says the right thing in May. */
function useClosed(key: string, built: number) {
  const s = seasonFor(key);
  const [closed, setClosed] = useState(isClosed(s, built));
  useEffect(() => { setClosed(isClosed(s, cyMonth())); }, [s]);
  return s && closed ? s : undefined;
}

export function SeasonBanner({ k, built }: { k: string; built: number }) {
  const s = useClosed(k, built);
  if (!s) return null;
  return <div className="notice notice-season" role="status"><strong>{SEASON_LABEL}</strong><p>{seasonLine(s).replace(/^Closed for the season\. /, "")}</p></div>;
}

export function SeasonTag({ k, built }: { k: string; built: number }) {
  const s = useClosed(k, built);
  return s ? <span className="season-tag">{SEASON_LABEL}</span> : null;
}
