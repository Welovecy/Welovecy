"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSaved } from "@/lib/store";

const I = {
  home: <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1z" />,
  explore: <><circle cx="12" cy="12" r="8.5" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>,
  around: <><path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" /><circle cx="12" cy="10" r="2.2" /></>,
  saved: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4-4" /></>,
};
const TABS: [string, string, keyof typeof I][] = [
  ["/", "Home", "home"], ["/destinations", "Explore", "explore"], ["/around", "Around you", "around"], ["/saved", "Saved", "saved"], ["/search", "Search", "search"],
];

/** Phone-style tab bar. Shown on small screens only; the header menu covers everything else. */
export function TabBar() {
  const path = usePathname();
  const saved = useSaved();
  const on = (h: string) => (h === "/" ? path === "/" : path === h || path.startsWith(h + "/") || (h === "/destinations" && /^\/(places|beaches|must-see|stay|things|buses)/.test(path)));
  return (
    <nav className="tabbar" aria-label="Quick links">
      {TABS.map(([h, label, icon]) => (
        <Link key={h} href={h} className="tab" aria-current={on(h) ? "page" : undefined}>
          <span className="tab-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill={on(h) && icon === "saved" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{I[icon]}</svg>
            {icon === "saved" && saved.length ? <span className="tab-badge">{saved.length > 99 ? "99+" : saved.length}</span> : null}
          </span>
          <span className="tab-label">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
