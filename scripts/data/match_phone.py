"""Pin records that have no location by matching their registered phone number to an Overture Maps place,
then (pharmacies only) by the pharmacist's name to an Overture pharmacy in the same town.

A phone number is the strongest match we have: the register and the map listing share it. We still require the
pin to sit within reach of the record's town (or its area centre when no other record in that town is pinned),
and skip numbers that belong to places more than 200 m apart (chains, head offices).

Usage: python3 scripts/data/match_phone.py OVERTURE_PLACES_JSON
Writes into data/work/overture_pins.json (read by apply_pins.py), never over an existing entry.
"""
import collections, json, re, sys
sys.path.insert(0, "scripts/data")
from match_overture import km, sim

CENTRES = {"ayianapa": [34.9871, 33.9995], "protaras": [35.0125, 34.0583], "larnaca": [34.9182, 33.6201], "limassol": [34.6786, 33.0413],
           "paphos": [34.7720, 32.4297], "akamas": [35.0365, 32.4250], "nicosia": [35.1725, 33.3650], "troodos": [34.9221, 32.8800]}
TOWN_KM, AREA_KM = 6, 25
CATS = {"pharmacy": ("pharmacy",), "health": ("hospital", "clinic", "doctor", "medical", "health"), "market": ("food", "grocery", "supermarket", "convenience", "market")}

def in_republic(ll):
    """Same line as tests/data.test.ts: never pin anything north of the line of control."""
    lat, lon = ll
    if lat < 34.55 or lat > 35.25 or lon < 32.25 or lon > 34.6: return False
    if 32.75 <= lon < 33.25 and lat > 35.175: return False
    if 32.75 <= lon < 32.95 and lat > 35.095: return False
    if 33.25 <= lon < 33.43 and lat > 35.185: return False
    if 33.43 <= lon < 33.95 and lat > 35.14: return False
    if lon >= 33.95 and lat > 35.1: return False
    return True

def ph8(s):
    d = re.sub(r"\D", "", str(s or ""))
    if d.startswith("00357"): d = d[5:]
    elif d.startswith("357") and len(d) == 11: d = d[3:]
    return d if len(d) == 8 else None

def main(path):
    places = [o for o in json.load(open(path)) if o.get("ll") and in_republic(o["ll"])]
    pois = json.load(open("data/pois.json", encoding="utf-8"))
    biz = json.load(open("data/businesses.json", encoding="utf-8"))
    pins = json.load(open("data/work/overture_pins.json", encoding="utf-8"))
    by_ph = collections.defaultdict(list)
    for o in places:
        for p in str(o.get("ph") or "").split(";"):
            if ph8(p): by_ph[ph8(p)].append(o)
    town = collections.defaultdict(list)
    for r in pois + biz:
        if r.get("ll") and r.get("tw") and not r.get("pr"): town[(r["tw"], r["d"])].append(r["ll"])
    tc = {k: [sum(x[0] for x in v) / len(v), sum(x[1] for x in v) / len(v)] for k, v in town.items() if len(v) >= 2}

    def near_home(r, ll):
        c = tc.get((r.get("tw"), r["d"]))
        return km(ll, c) <= TOWN_KM if c else km(ll, CENTRES[r["d"]]) <= AREA_KM

    stats = collections.Counter()
    def take(r, o, by, score):
        pins[r["i"]] = {"ll": o["ll"], "ov": o["id"], "on": o["n"], "score": score, "by": by}
        stats[(r.get("k") or r.get("g"), by)] += 1

    todo = [r for r in pois if r["k"] in CATS and not r.get("ll")] + [r for r in biz if not r.get("ll")]
    for r in todo:
        if r["i"] in pins: continue
        hits = by_ph.get(ph8(r.get("ph") or r.get("p")), [])
        if not hits: continue
        if max(km(a["ll"], b["ll"]) for a in hits for b in hits) > 0.2: stats["skip: one number, several places"] += 1; continue
        if not near_home(r, hits[0]["ll"]): stats["skip: pin far from its town"] += 1; continue
        take(r, hits[0], "phone", 1.0)

    # pharmacists' names: only to an Overture pharmacy, only in the same town, only one candidate
    shops = [o for o in places if "pharmacy" in (o.get("cat") or "")]
    for r in pois:
        if r["k"] != "pharmacy" or r.get("ll") or r["i"] in pins: continue
        cands = [o for o in shops if near_home(r, o["ll"]) and sim(r["n"], o["n"], r.get("tw", "")) >= 0.6]
        if len(cands) == 1: take(r, cands[0], "name", round(sim(r["n"], cands[0]["n"], r.get("tw", "")), 2))
        elif len(cands) > 1: stats["skip: several pharmacies match the name"] += 1

    json.dump(pins, open("data/work/overture_pins.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    for k, v in sorted(stats.items(), key=str): print(k, v)

if __name__ == "__main__":
    main(sys.argv[1])
