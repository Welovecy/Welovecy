/** Local spellings people actually type, mapped to the names we use. */
export const ALIASES: Record<string, string> = {
  "agia napa": "ayia napa", "aya napa": "ayia napa", "ayianapa": "ayia napa", "protara": "protaras",
  "petra tou romiou": "aphrodite", "konos": "konnos", "derynia": "deryneia",
  "larnaka": "larnaca", "lefkosia": "nicosia", "lemesos": "limassol", "pafos": "paphos",
  "latsi": "latchi", "lefkaritika": "lefkara", "khirokitia": "choirokoitia", "chirokitia": "choirokoitia",
  "choirokitia": "choirokoitia",
};

const GREEK: Record<string, string> = {
  α: "a", ά: "a", β: "v", γ: "g", δ: "d", ε: "e", έ: "e", ζ: "z", η: "i", ή: "i", θ: "th", ι: "i", ί: "i", ϊ: "i", ΐ: "i",
  κ: "k", λ: "l", μ: "m", ν: "n", ξ: "x", ο: "o", ό: "o", π: "p", ρ: "r", σ: "s", ς: "s", τ: "t", υ: "y", ύ: "y", ϋ: "y",
  φ: "f", χ: "ch", ψ: "ps", ω: "o", ώ: "o",
};

function escapeRe(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
const ALIAS_RES = Object.entries(ALIASES).map(([a, b]) => [new RegExp(`\\b${escapeRe(a)}\\b`, "g"), b] as const);

/** Lowercase, strip accents, transliterate Greek, apply local aliases. */
export function norm(q: string): string {
  let s = q.toLowerCase().normalize("NFC");
  s = s.replace(/[Ͱ-Ͽἀ-῿]/g, (c) => GREEK[c] ?? c);
  s = s.normalize("NFD").replace(/[̀-ͯ]/g, "");
  s = s.replace(/[’'`]/g, "").replace(/[^a-z0-9& ]+/g, " ").replace(/\s+/g, " ").trim();
  for (const [re, to] of ALIAS_RES) s = s.replace(re, to);
  return s;
}

export function slugify(s: string): string {
  return norm(s).replace(/&/g, "and").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export function stars(c?: string): string {
  if (!c) return "";
  const m = /^(\d)\*$/.exec(c);
  return m ? `${m[1]}-star` : "";
}

export function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
