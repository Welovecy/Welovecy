"""
Cuisine and venue type for restaurants, cafes, bars and clubs.

Sources, in order: hand tags (data/work/venue_tags.json, from our own list), OpenStreetMap's cuisine tag
(data/work/osm_pins.json), then words in the registered name and licence type. Nothing is guessed beyond that:
a venue with no signal stays plain "Restaurant".
"""
import re

# cuisine id -> (label, name patterns, OpenStreetMap cuisine values)
CUISINES = {
    "cypriot":   ("Cypriot and meze", r"\b(meze|mezze|mezedes|cypriot|kypriak|kleftiko|souvla|taverna|tavern|tavernaki|ταβερν|μεζε|παραδοσιακ|traditional|village|horiatik|χωριατ)\b", {"cypriot", "regional", "local", "meze"}),
    "greek":     ("Greek", r"\b(greek|ellin|souvlaki|souvlakia|gyros|gyro|σουβλακ|γυρο|pita|pitta)\b", {"greek", "souvlaki", "gyros"}),
    "seafood":   ("Fish and seafood", r"\b(fish|psaro|psarotaverna|seafood|sea food|octopus|ψαρ|θαλασσιν|oyster|lobster)\b", {"seafood", "fish"}),
    "italian":   ("Italian and pizza", r"\b(italian|italiano|trattoria|osteria|pizza|pizzeria|pasta|ristorante|πιτσ)\b", {"italian", "pizza", "italian_pizza", "pasta"}),
    "asian":     ("Asian and sushi", r"\b(chinese|china|wok|noodle|sushi|japanese|japan|ramen|thai|thailand|vietnam|pho|korean|asian|asia|dim sum|teppan|yakitori|peking|canton|shanghai|hong kong|bao)\b", {"chinese", "japanese", "sushi", "thai", "vietnamese", "korean", "asian", "noodle", "ramen"}),
    "indian":    ("Indian and Nepali", r"\b(indian|india|tandoor|tandoori|curry|balti|masala|nepal|nepalese|bombay|mumbai|delhi|punjab|bengal)\b", {"indian", "nepalese", "curry"}),
    "middleeast":("Lebanese and Middle Eastern", r"\b(lebanese|leban|beirut|syrian|damascus|arab|arabic|shawarma|falafel|persian|iranian|armenian|georgian|turkish)\b", {"lebanese", "syrian", "arab", "middle_eastern", "persian", "armenian", "georgian", "falafel", "shawarma"}),
    "grill":     ("Steak and grill", r"\b(steak|steakhouse|grill|grillhouse|bbq|barbecue|smokehouse|churrasc|meat)\b", {"steak_house", "steak", "grill", "barbecue", "bbq", "bar_and_grill"}),
    "burger":    ("Burgers and fast food", r"\b(burger|burgers|fries|wings|chicken|kfc|mcdonald|hot dog|fast food)\b", {"burger", "chicken", "fast_food", "hot_dog", "sandwich"}),
    "mexican":   ("Mexican and Latin", r"\b(mexican|mexico|taco|tacos|burrito|cantina|latino|latin|brazil|argentin|peru)\b", {"mexican", "tex-mex", "latin_american", "brazilian", "argentinian", "peruvian"}),
    "brunch":    ("Breakfast and brunch", r"\b(breakfast|brunch|pancake|waffle|bakery|patisserie|bake|boulangerie|crepe|crêpe|bagel)\b", {"breakfast", "brunch", "pancake", "crepe", "bagel"}),
    "dessert":   ("Desserts and ice cream", r"\b(gelato|gelateria|ice cream|dessert|sweets|chocolate|cake|γλυκ|παγωτ)\b", {"ice_cream", "dessert", "cake", "chocolate", "frozen_yogurt"}),
    "british":   ("British and pub food", r"\b(english|british|fish and chips|fish & chips|chippy|sunday roast|irish)\b", {"british", "fish_and_chips", "english", "irish"}),
    "vegan":     ("Vegetarian and vegan", r"\b(vegan|vegetarian|plant based|plant-based|veggie|healthy|salad)\b", {"vegan", "vegetarian", "salad", "healthy"}),
}

# venue types: what people go out for. Cabarets are left out of the public pages on purpose.
def venue_type(b, osm_t=""):
    lic = (b.get("l") or "").lower(); n = (b.get("n") or "").lower(); g = b.get("g")
    if "cabaret" in lic or "καμπαρε" in lic or "cabaret" in n: return "cabaret"
    if osm_t == "nightclub" or re.search(r"\b(club|disco|music venue|music and dance)\b", lic) or re.search(r"\b(night ?club|disco)\b", n): return "club"
    if osm_t == "beach_resort" or re.search(r"\bbeach (bar|club)\b", n): return "beachbar"
    if g == "night" or osm_t in ("bar", "pub", "biergarten"):
        return "pub" if ("pub" in lic or osm_t == "pub" or re.search(r"\b(pub|inn|tavern pub)\b", n)) else "bar"
    if g == "cafe" or osm_t in ("cafe", "ice_cream"):
        return "snack" if "snack" in lic and not re.search(r"\b(cafe|coffee|caf[eé])\b", n) else "cafe"
    if "tavern" in lic or "ταβερν" in lic or re.search(r"\b(taverna|tavern|ταβερν)\b", n): return "taverna"
    return "restaurant"

def cuisines(b, osm_cu="", hand=None):
    if hand: return hand
    found = []
    osm = {c.strip().lower() for c in re.split(r"[;,]", osm_cu or "") if c.strip()}
    text = f"{b.get('n','')} {b.get('l','')}".lower()
    for cid, (_, pat, osmv) in CUISINES.items():
        if osm & osmv or re.search(pat, text): found.append(cid)
    # a taverna is Cypriot food unless told otherwise
    if not found and venue_type(b) == "taverna": found.append("cypriot")
    if "pizzeria" in (b.get("l") or "").lower() and "italian" not in found: found.append("italian")
    return found[:3]

SMALL = {"and", "of", "the", "at", "in", "on", "by", "a", "to", "de", "la", "le", "di", "del"}
def clean_name(n):
    """Readable display names: no trailing (town) or (owner) notes from the register, no shouting capitals."""
    s = re.sub(r"\s*\([^()]*\)\s*$", "", n).strip() or n
    s = re.sub(r"\s{2,}", " ", s)
    latin = re.sub(r"[^A-Za-z]", "", s)
    if len(latin) > 4 and sum(c.isupper() for c in latin) / len(latin) > 0.8:
        words = s.lower().split(" ")
        s = " ".join(w if (i and w in SMALL) else (w[:1].upper() + w[1:]) for i, w in enumerate(words))
        s = re.sub(r"'S\b", "'s", s)
    return re.sub(r"\bRest\.(?=\s|$)", "Restaurant", s, flags=re.I)
