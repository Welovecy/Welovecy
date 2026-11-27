"""
Build data/motoring.json: petrol stations and car hire offices from the OpenStreetMap extract
(motoring.yml -> data/work/osm_motoring.json). Republic only. Each gets a pin, its brand, the address and
opening hours where mapped, and the OpenStreetMap credit. EV chargers are kept in the work file for later.
"""
import json, math, sys
sys.path.insert(0, "scripts/data")
from match_overture import in_republic as _rough
def in_republic(ll):
    # the site's boundary (tests/data.test.ts), which also leaves out Lefka
    return _rough(ll) and not (32.75 <= ll[1] < 32.95 and ll[0] > 35.095)

SRC = json.load(open("data/work/osm_motoring.json"))
BIZ = json.load(open("data/businesses.json"))
TOWNS = [(b["ll"], b["tw"]) for b in BIZ if b.get("ll") and not b.get("pr") and b.get("tw") and b["tw"] != "Not specified"]

def km(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 6371 * 2 * math.asin(math.sqrt(h))

def town(ll):
    best, bd = None, 3.0
    for p, t in TOWNS:
        if abs(p[0] - ll[0]) > 0.03 or abs(p[1] - ll[1]) > 0.03: continue
        d = km(ll, p)
        if d < bd: best, bd = t, d
    return best

BRAND = {"eko": "EKO", "petrolina": "Petrolina", "esso": "Esso", "shell": "Shell", "k-pet": "K-Pet", "agip": "Agip", "eni": "Eni", "alpet": "Alpet",
         "staroil": "Staroil", "star oil": "Staroil", "total": "TotalEnergies", "fill": "Fill", "repsol": "Repsol"}
def brand(t):
    raw = (t.get("brand") or t.get("name:en") or t.get("name") or t.get("operator") or "").strip()
    low = raw.lower()
    for k, v in BRAND.items():
        if low.startswith(k): return v
    return raw

FUELS = [("fuel:octane_95", "95"), ("fuel:octane_98", "98"), ("fuel:diesel", "Diesel"), ("fuel:lpg", "LPG"), ("fuel:adblue", "AdBlue")]
out = []
for it in SRC["items"]:
    if it["k"] not in ("fuel", "car_rental") or not in_republic(it["ll"]): continue
    t = it["tags"]
    tw = t.get("addr:city") or town(it["ll"])
    street = " ".join(x for x in [t.get("addr:street", ""), t.get("addr:housenumber", "")] if x)
    osm = f"https://www.openstreetmap.org/{ {'n': 'node', 'w': 'way'}[it['id'][0]] }/{it['id'][1:]}"
    rec = {"i": f"osm-{it['id']}", "ll": it["ll"], "a": street or None, "tw": tw,
           "ph": t.get("phone") or t.get("contact:phone") or None, "web": t.get("website") or t.get("contact:website") or None,
           "srcs": [{"t": "Location and details: OpenStreetMap contributors", "u": osm}]}
    oh = t.get("opening_hours", "")
    if oh == "24/7": rec["hrs"] = "Open 24 hours"; rec["h24"] = True
    elif oh: rec["hrsNote"] = f"Opening hours on OpenStreetMap: {oh}. Check before you go."
    if it["k"] == "fuel":
        b = brand(t)
        rec.update({"k": "fuel", "cat": "Petrol station", "brand": b or None,
                    "n": f"{b or 'Petrol station'}{', ' + tw if tw else ''}"})
        fu = [n for k, n in FUELS if t.get(k) == "yes"]
        if fu: rec["fuels"] = fu
        if t.get("automated") == "yes" or t.get("self_service") == "yes": rec["self"] = True
    else:
        name = (t.get("name:en") or t.get("name") or t.get("brand") or t.get("operator")).strip()
        rec.update({"k": "carhire", "cat": "Car hire", "n": name, "brand": t.get("brand") or None})
        if t.get("airport") or "airport" in name.lower(): rec["airport"] = True
    out.append({k: v for k, v in rec.items() if v not in (None, "", [])})

from collections import Counter as _C
dup = _C((r["k"], r["n"]) for r in out)
for r in out:
    if r["k"] == "carhire" and dup[(r["k"], r["n"])] > 1 and r.get("tw") and r["tw"].lower() not in r["n"].lower(): r["n"] = f"{r['n']}, {r['tw']}"
out.sort(key=lambda r: (r["k"], r["n"]))
json.dump({"checked": "2026-11-27", "source": "OpenStreetMap contributors (ODbL), Geofabrik extract", "items": out}, open("data/motoring.json", "w"), ensure_ascii=False, indent=0)
from collections import Counter
print(Counter(r["k"] for r in out), "no town:", sum(1 for r in out if not r.get("tw")))
