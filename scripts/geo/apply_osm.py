"""Apply OpenStreetMap pins and cuisine (data/work/osm_pins.json) and our venue types to data/businesses.json.

Runs last in `npm run data`. Safe to run again: pins are only added where a record has none,
and type and cuisine are worked out afresh each time.
"""
import collections, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from classify import cuisines, venue_type

PATH = "data/businesses.json"
biz = json.load(open(PATH, encoding="utf-8"))
pins = json.load(open("data/work/osm_pins.json", encoding="utf-8")) if os.path.exists("data/work/osm_pins.json") else {}
hand = json.load(open("data/work/venue_tags.json", encoding="utf-8")) if os.path.exists("data/work/venue_tags.json") else {}
added = collections.Counter()
for b in biz:
    p = pins.get(b["i"], {})
    if "ll" in p and not b.get("ll"):
        b["ll"] = p["ll"]; b["ls"] = "osm"
        if p["how"] in ("street", "postcode"): b["pr"] = "approx"
        added[p["how"]] += 1
    if b["g"] in ("eat", "cafe", "night"):
        h = hand.get(b["i"], {})
        b["vt"] = h.get("vt") or venue_type(b, p.get("t", ""))
        b["cz"] = cuisines(b, p.get("cu", ""), h.get("cz"))
        if not b["cz"]: b.pop("cz")
json.dump(biz, open(PATH, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
v = [b for b in biz if b["g"] in ("eat", "cafe", "night")]
print("new pins:", dict(added))
print("venues pinned:", sum(1 for b in v if b.get("ll")), "of", len(v), "| approximate:", sum(1 for b in v if b.get("pr") == "approx"))
print("with a cuisine:", sum(1 for b in v if b.get("cz")), "| types:", dict(collections.Counter(b["vt"] for b in v)))
