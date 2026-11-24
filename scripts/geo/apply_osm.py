"""Apply OpenStreetMap pins and cuisine (data/work/osm_pins.json) and our venue types to data/businesses.json.

Runs last in `npm run data`. Safe to run again: pins are only added where a record has none,
and type and cuisine are worked out afresh each time.
"""
import collections, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from classify import clean_name, cuisines, venue_type

PATH = "data/businesses.json"

def in_republic(ll):
    """Same line as tests/data.test.ts: Republic of Cyprus only, never a pin in the north."""
    lat, lon = ll
    if lat < 34.55 or lat > 35.25 or lon < 32.25 or lon > 34.6: return False
    if 32.75 <= lon < 33.25 and lat > 35.175: return False
    if 32.75 <= lon < 32.95 and lat > 35.095: return False
    if 33.25 <= lon < 33.43 and lat > 35.185: return False
    if 33.43 <= lon < 33.95 and lat > 35.14: return False
    if lon >= 33.95 and lat > 35.1: return False
    return True
biz = json.load(open(PATH, encoding="utf-8"))
pins = json.load(open("data/work/osm_pins.json", encoding="utf-8")) if os.path.exists("data/work/osm_pins.json") else {}
# register hotels we matched by hand to an OpenStreetMap pin (from the reviewed hotel list)
checked = json.load(open("data/work/checked_pins.json", encoding="utf-8")) if os.path.exists("data/work/checked_pins.json") else {}
hand = json.load(open("data/work/venue_tags.json", encoding="utf-8")) if os.path.exists("data/work/venue_tags.json") else {}
added = collections.Counter()
for b in biz:
    if b["g"] in ("eat", "cafe", "night", "hotel", "apart"):
        b["n"] = clean_name(b["n"])
    if b["i"] in checked and not b.get("ll"):
        b["ll"] = checked[b["i"]]["ll"]; b["ls"] = "osm"; added["checked by hand"] += 1
    p = pins.get(b["i"], {})
    # hotels only take exact matches: a street or postcode pin would put wrong distances on "Hotels near" pages
    exact_only = b["g"] in ("hotel", "apart")
    if b.get("ls") == "osm" and b.get("ll") and not in_republic(b["ll"]):
        b.pop("ll"); b.pop("ls"); b.pop("pr", None); added["dropped (outside the Republic)"] += 1
    if "ll" in p and not b.get("ll") and in_republic(p["ll"]) and not (exact_only and p["how"] in ("street", "postcode")):
        b["ll"] = p["ll"]; b["ls"] = "osm"
        if p["how"] == "street": b["pr"] = "approx"
        if p["how"] == "postcode": b["pr"] = "area"
        added[p["how"]] += 1

    # Paralimni addresses on the coast are Protaras to a visitor (same rule as apply_pins.py)
    if b.get("ls") == "osm" and b.get("tw") == "Paralimni" and b["ll"][1] >= 34.03: b["tw"] = "Protaras"
    if b["g"] in ("eat", "cafe", "night"):
        h = hand.get(b["i"], {})
        b["vt"] = h.get("vt") or venue_type(b, p.get("t", ""))
        b["cz"] = cuisines(b, p.get("cu", ""), h.get("cz"))
        if not b["cz"]: b.pop("cz")
json.dump(biz, open(PATH, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
v = [b for b in biz if b["g"] in ("eat", "cafe", "night")]
print("new pins:", dict(added))
print("venues pinned:", sum(1 for b in v if b.get("ll")), "of", len(v), "| street-level:", sum(1 for b in v if b.get("pr") == "approx"), "| postcode-level:", sum(1 for b in v if b.get("pr") == "area"))
print("with a cuisine:", sum(1 for b in v if b.get("cz")), "| types:", dict(collections.Counter(b["vt"] for b in v)))
