"""Match our listings to Overture Maps places (CDLA Permissive 2.0 / Apache 2.0) by name, area and type.

Usage: python3 scripts/data/match_overture.py PLACES_JSON [--compare]
PLACES_JSON is the Cyprus extract of the Overture places theme (see scripts/data/README.md).
--compare runs on records we already have pins for and reports how far Overture is from them.
"""
import json, math, re, statistics, sys, unicodedata, collections

def km(a, b):
    t = math.pi / 180
    x = math.sin((b[0]-a[0])*t/2)**2 + math.cos(a[0]*t)*math.cos(b[0]*t)*math.sin((b[1]-a[1])*t/2)**2
    return 2*6371*math.asin(math.sqrt(x))

GREEK = dict(zip("αβγδεζηθικλμνξοπρστυφχψως", ["a","v","g","d","e","z","i","th","i","k","l","m","n","x","o","p","r","s","t","i","f","ch","ps","o","s"]))
def translit(s):
    s = unicodedata.normalize("NFD", (s or "").lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = "".join(GREEK.get(c, c) for c in s)
    s = s.replace("ou", "u").replace("y", "i").replace("h", "").replace("ck", "k").replace("ph", "f").replace("w", "v")
    s = re.sub(r"(.)\1", r"\1", s)                      # double letters
    return re.sub(r"[^a-z0-9 ]", " ", s)

GENERIC = set(translit(" ".join("""hotel hotels resort resorts suites suite apartments apartment apts apart studios studio villas villa
 beach boutique spa and the by of club holiday holidays hostel inn rooms residence residences complex
 restaurant restaurants taverna tavern cafe caffe coffee bar bars pub lounge grill kitchen bistro snack
 pharmacy farmakio pharmacie chemist supermarket market hypermarket mini store clinic polyclinic hospital medical centre center
 ltd limited cy cyprus to tis tou ton ta spiti steak house steakhouse flambe burger burgers fish meze grill tavern taverna snack
 φαρμακειο φαρμακείο ξενοδοχειο εστιατοριο""".split())).split())

def toks(s):
    return {w for w in translit(s).split() if len(w) > 1 and w not in GENERIC}

def sim(a, b, town=""):
    """Jaccard on distinctive words. The record's own town name doesn't count; other towns do (Sunprime Protaras is not Sunprime Ayia Napa)."""
    drop = toks(town) | {"ayia", "agia", "aia"} if town else set()
    ta, tb = toks(a) - drop, toks(b) - drop
    if not ta or not tb: return 0.0
    inter = len(ta & tb)
    if not inter: return 0.0
    j = inter / len(ta | tb)
    if len(ta) >= 2 and len(tb) >= 2:
        j = max(j, 0.9 * inter / min(len(ta), len(tb)))   # one name contains the other
    return j

CATS = {
    "stay": re.compile(r"hotel|resort|accommodation|lodging|apartment|guest_house|hostel|bed_and_breakfast|holiday|vacation|inn|motel|villa"),
    "pharmacy": re.compile(r"pharmacy|drug"),
    "market": re.compile(r"supermarket|grocery|food_and_beverage_store|convenience|market|hypermarket"),
    "health": re.compile(r"hospital|clinic|medical|health|doctor|physician|emergency"),
    "eat": re.compile(r"restaurant|eatery|cafe|coffee|bar|pub|bakery|food|grill|tavern|pizza|burger|fast_food|dessert|ice_cream|lounge|night|club|bistro|brewery|wine|cocktail|beach_bar|snack"),
}
def group_of(r):
    g = r.get("g") or r.get("k")
    return {"hotel": "stay", "apart": "stay", "eat": "eat", "cafe": "eat", "night": "eat"}.get(g, g)

DEST_CENTRE = {"ayianapa": [34.9875, 33.9995], "protaras": [35.017, 34.05], "paphos": [34.775, 32.43], "akamas": [35.03, 32.43],
               "limassol": [34.68, 33.04], "larnaca": [34.915, 33.63], "nicosia": [35.17, 33.36], "troodos": [34.94, 32.86]}

def in_republic(ll):
    lat, lon = ll
    if lat < 34.55 or lat > 35.25 or lon < 32.25 or lon > 34.6: return False
    if 32.75 <= lon < 33.25 and lat > 35.175: return False
    if 33.25 <= lon < 33.43 and lat > 35.185: return False
    if 33.43 <= lon < 33.95 and lat > 35.14: return False
    if lon >= 33.95 and lat > 35.1: return False
    return True

def main():
    places = [p for p in json.load(open(sys.argv[1], encoding="utf-8")) if p.get("n") and in_republic(p["ll"])]
    compare = "--compare" in sys.argv
    biz = json.load(open("data/businesses.json", encoding="utf-8"))
    pois = json.load(open("data/pois.json", encoding="utf-8"))
    # town centres from what we already know
    pts = collections.defaultdict(list)
    for r in biz + pois:
        if r.get("ll") and r.get("tw") and r["tw"] != "Not specified": pts[r["tw"]].append(r["ll"])
    centres = {t: [statistics.median(p[0] for p in v), statistics.median(p[1] for p in v)] for t, v in pts.items() if len(v) >= 3}
    by_cat = collections.defaultdict(list)
    for p in places:
        cat = (p.get("cat") or "") + " " + (p.get("tax") or "")
        for g, rx in CATS.items():
            if rx.search(cat): by_cat[g].append(p)
    recs = [r for r in biz] + [r for r in pois if r["k"] in ("pharmacy", "market", "health")]
    recs = [r for r in recs if bool(r.get("ll")) == compare and (not compare or r.get("src") != "osm")]
    out, diffs, used = {}, [], set()
    stats = collections.Counter()
    for r in recs:
        g = group_of(r)
        tw = r.get("tw") if r.get("tw") not in (None, "", "Not specified") else None
        centre = centres.get(tw) or DEST_CENTRE[r["d"]]
        radius = 7 if tw in centres else 25
        name = r["n"]
        best, bs = None, 0.0
        for p in by_cat.get(g, []):
            if km(p["ll"], centre) > radius: continue
            s = sim(name, p["n"], tw or "")
            if g in ("market", "pharmacy") and r.get("a") and s >= 0.6:
                # chains and pharmacies: the street must match too, or it's another branch
                if not p.get("addr") or not (toks(r["a"]) & toks(p["addr"])): s = 0.0
            if s > bs or (s == bs and best and (p.get("conf") or 0) > (best.get("conf") or 0)):
                best, bs = p, s
        ok = best is not None and bs >= 0.6 and (best.get("conf") or 0) >= 0.5
        if ok and len(toks(name) - toks(tw or "")) == 1:
            # one-word names (Maria, Flora): only when exactly one place in the area carries that name
            rivals = [p for p in by_cat.get(g, []) if km(p["ll"], centre) <= radius and sim(name, p["n"], tw or "") >= bs - 0.01]
            ok = len({p["id"] for p in rivals}) == 1 and toks(best["n"]) - toks(tw or "") - {"ayia", "agia", "aia"} == toks(name) - toks(tw or "")
        if not ok:
            stats["miss", g] += 1; continue
        stats["hit", g] += 1
        if compare:
            diffs.append((km(best["ll"], r["ll"]), g, r["n"], best["n"], r["d"]))
        else:
            out[r["i"]] = {"ll": best["ll"], "ov": best["id"], "on": best["n"], "score": round(bs, 2)}
    for (k, g), v in sorted(stats.items(), key=lambda x: (x[0][1], x[0][0])): print(f"{g:9} {k:5} {v}")
    if compare:
        diffs.sort()
        for g in ("stay", "eat", "pharmacy", "market", "health"):
            d = [x[0] for x in diffs if x[1] == g]
            if d: print(f"{g:9} matched {len(d):4} · median {statistics.median(d)*1000:4.0f} m · within 100 m {sum(x<=0.1 for x in d)} · within 250 m {sum(x<=0.25 for x in d)} · over 1 km {sum(x>1 for x in d)}")
        json.dump(diffs, open("data/work/overture_compare.json", "w"), ensure_ascii=False, indent=0)
    else:
        json.dump(out, open("data/work/overture_pins.json", "w"), ensure_ascii=False, indent=0)
        print("pins", len(out))

if __name__ == "__main__":
    main()
