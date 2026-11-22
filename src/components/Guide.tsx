import type { Place, UnescoId } from "@/lib/types";
import { getLocality, getDest } from "@/lib/data";

export const UNESCO_NAMES: Record<UnescoId, string> = {
  paphos: "Paphos", choirokoitia: "Choirokoitia", troodos: "Painted Churches in the Troodos Region",
};

export function UnescoBadge({ id }: { id: UnescoId }) {
  return (
    <span className="flag flag-unesco" title={`UNESCO World Heritage: ${UNESCO_NAMES[id]}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" /></svg>
      UNESCO World Heritage
    </span>
  );
}

/** The locality page a place belongs to, if there is one. */
export function localityOf(p: Place): { title: string; href: string } | null {
  if (!p.locality) return null;
  const [dest, slug] = p.locality.split("/");
  const l = getLocality(dest, slug);
  return l && getDest(dest) ? { title: l.title, href: `/destinations/${dest}/${slug}` } : null;
}
