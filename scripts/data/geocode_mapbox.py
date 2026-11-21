"""Pin addresses with Mapbox permanent geocoding (results may be stored).

Usage: MAPBOX_TOKEN=... python3 scripts/data/geocode_mapbox.py [--limit N] [--sample]
Every request and answer is kept in data/work/mapbox_cache.jsonl, so a rerun never pays twice.
A hard cap stops the run before it can cost more than agreed.
"""
import json, math, os, re, sys, time, urllib.parse, urllib.request, statistics

HARD_CAP = 4000           # total billed requests ever, across runs (~$20 at $5 per 1,000)
CACHE = "data/work/mapbox_cache.jsonl"
TOKEN = os.environ.get("MAPBOX_TOKEN", "")

def km(a, b):
    t = math.pi / 180
    x = math.sin((b[0]-a[0])*t/2)**2 + math.cos(a[0]*t)*math.cos(b[0]*t)*math.sin((b[1]-a[1])*t/2)**2
    return 2*6371*math.asin(math.sqrt(x))

def load_cache():
    c = {}
    if os.path.exists(CACHE):
        for line in open(CACHE, encoding="utf-8"):
            r = json.loads(line); c[r["q"]] = r
    return c

def query(q, prox, cache, box_km=None):
    key = q + (f" |box{box_km}" if box_km else "")
    if key in cache: return cache[key]["res"]
    if len(cache) >= HARD_CAP: raise SystemExit(f"Hard cap of {HARD_CAP} requests reached")
    params = {"q": q, "country": "cy", "limit": "1", "permanent": "true", "autocomplete": "false",
              "types": "address,street", "access_token": TOKEN}
    if prox: params["proximity"] = f"{prox[1]},{prox[0]}"
    if prox and box_km:
        dlat, dlon = box_km / 111, box_km / (111 * math.cos(prox[0] * math.pi / 180))
        params["bbox"] = f"{prox[1]-dlon:.4f},{prox[0]-dlat:.4f},{prox[1]+dlon:.4f},{prox[0]+dlat:.4f}"
    url = "https://api.mapbox.com/search/geocode/v6/forward?" + urllib.parse.urlencode(params)
    for attempt in range(3):
        try:
            with urllib.request.urlopen(url, timeout=20) as r: data = json.load(r)
            break
        except urllib.error.HTTPError as e:
            if e.code == 429: time.sleep(2 + attempt * 3); continue
            raise
    f = (data.get("features") or [None])[0]
    res = None
    if f:
        p = f["properties"]
        res = {"t": p.get("feature_type"), "addr": p.get("full_address"), "ll": [p["coordinates"]["latitude"], p["coordinates"]["longitude"]],
               "conf": (p.get("match_code") or {}).get("confidence"), "acc": p["coordinates"].get("accuracy"),
               "place": ((p.get("context") or {}).get("place") or {}).get("name")}
    cache[key] = {"q": key, "res": res}
    with open(CACHE, "a", encoding="utf-8") as fh: fh.write(json.dumps(cache[key], ensure_ascii=False) + "\n")
    time.sleep(0.12)
    return res

def clean(a):
    a = re.sub(r"\s+", " ", a or "").strip(" ,")
    return a

def town_centres(biz, pois):
    pts = {}
    for r in biz + pois:
        if r.get("ll") and r.get("tw") and r["tw"] != "Not specified":
            pts.setdefault(r["tw"], []).append(r["ll"])
    return {t: [statistics.median(p[0] for p in v), statistics.median(p[1] for p in v)] for t, v in pts.items() if len(v) >= 3}

DEST_CENTRE = {"ayianapa": [34.9875, 33.9995], "protaras": [35.017, 34.05], "paphos": [34.775, 32.43], "akamas": [35.03, 32.43],
               "limassol": [34.68, 33.04], "larnaca": [34.915, 33.63], "nicosia": [35.17, 33.36], "troodos": [34.94, 32.86]}

GREEK = dict(zip("αάβγδεέζηήθιίϊΐκλμνξοόπρσςτυύϋφχψωώ", ["a","a","v","g","d","e","e","z","i","i","th","i","i","i","i","k","l","m","n","x","o","o","p","r","s","s","t","y","y","y","f","ch","ps","o","o"]))
STOP = {"street","str","st","avenue","ave","av","leoforos","leof","odos","road","rd","arch","archiepiskopou","makariou","iii","g","cyprus","kat","shop","bldg","no"}
def toks(s):
    s = "".join(GREEK.get(c, c) for c in (s or "").lower())
    s = re.sub(r"[^a-z ]", " ", s)
    s = s.replace("y", "i").replace("ou", "u").replace("h", "")
    return {w for w in s.split() if len(w) > 2 and w not in STOP}

def same_street(q, res, town=""):
    a = toks(q) - toks(town) - toks(res["addr"].split(",")[-2] if res["addr"].count(",") >= 2 else "")
    b = toks(res["addr"].split(",")[0])
    return bool(a & b)

TOWN = [""]
def accept(res, centre, town_known, q=""):
    """Exact or high-confidence street address near where the record says it is."""
    if not res: return None, "no result"
    d = km(res["ll"], centre)
    limit = 6 if town_known else 30
    if d > limit: return None, f"{d:.0f} km from expected area"
    if not same_street(q, res, TOWN[0]): return None, "different street: " + (res["addr"] or "")[:40]
    if res["t"] == "address" and res.get("acc") in ("rooftop", "point", "parcel"): return "exact", ""
    if res["t"] == "address": return "approx", "interpolated address"
    if res["t"] == "street": return "approx", "street only"
    return None, f"type {res['t']}"

def main():
    if not TOKEN: raise SystemExit("Set MAPBOX_TOKEN")
    limit = int(sys.argv[sys.argv.index("--limit") + 1]) if "--limit" in sys.argv else None
    sample = "--sample" in sys.argv
    biz = json.load(open("data/businesses.json", encoding="utf-8"))
    pois = json.load(open("data/pois.json", encoding="utf-8"))
    centres = town_centres(biz, pois)
    todo = [("b", r) for r in biz if not r.get("ll") and r.get("a") and r["g"] in ("hotel", "apart")]
    todo += [("p", r) for r in pois if not r.get("ll") and r.get("a") and r["k"] in ("pharmacy", "market", "health")]
    if sample:
        pick = [x for x in todo if x[0] == "b"][:8] + [x for x in todo if x[1].get("k") == "pharmacy"][:8] + \
               [x for x in todo if x[1].get("k") == "market"][:2] + [x for x in todo if x[1].get("k") == "health"][:2]
        todo = pick
    if limit: todo = todo[:limit]
    cache = load_cache(); before = len(cache)
    out = json.load(open("data/work/mapbox_pins.json")) if os.path.exists("data/work/mapbox_pins.json") else {}
    stats = {"exact": 0, "approx": 0, "none": 0}
    for kind, r in todo:
        tw = r.get("tw") if r.get("tw") not in (None, "", "Not specified") else None
        centre = centres.get(tw) if tw else None
        known = centre is not None
        centre = centre or DEST_CENTRE[r["d"]]
        a = clean(r["a"])
        a = re.sub(r"Λεωφ\.?\s*", "Λεωφόρος ", a); a = re.sub(r",?\s*(κατ|Κατ|shop|Shop|bldg)\.?\s*[\w ]+$", "", a)
        TOWN[0] = tw or ""
        qs = [a if (tw and tw.lower() in a.lower()) else f"{a}, {tw}" if tw else a]
        best, why = None, ""
        for q in qs + ([re.sub(r"\b\d{4}\b", "", qs[0]).replace(" ,", ",")] if re.search(r"\b\d{4}\b", qs[0]) else []):
            res = query(q, centre, cache, 4 if known else 15)
            grade, why = accept(res, centre, known, q)
            if grade == "exact": best = (grade, res); break
            if grade and not best: best = (grade, res)
        if best:
            out[r["i"]] = {"ll": [round(best[1]["ll"][0], 6), round(best[1]["ll"][1], 6)], "pr": best[0], "addr": best[1]["addr"]}
            stats[best[0]] += 1
        else:
            stats["none"] += 1
        if sample: print(f'{best[0] if best else "MISS":6} | {r["n"][:28]:28} | {a[:45]:45} | {(best[1]["addr"] if best else why)[:60]}')
    json.dump(out, open("data/work/mapbox_pins.json", "w"), ensure_ascii=False, indent=0)
    used = len(cache) - before
    print(f"records {len(todo)} · exact {stats['exact']} · approx {stats['approx']} · missed {stats['none']} · new requests {used} (~${used*5/1000:.2f}) · total billed so far {len(cache)}")

if __name__ == "__main__":
    main()
