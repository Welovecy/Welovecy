"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** The app tabs (Search, Around you, Saved) get a slim footer: the full link list belongs on content pages. */
const TABS = new Set(["/search", "/around", "/saved"]);
export function FooterBody({ children }: { children: ReactNode }) {
  const p = usePathname();
  return TABS.has(p) ? null : <>{children}</>;
}
