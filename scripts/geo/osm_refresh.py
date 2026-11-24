"""
Refresh map pins and cuisine from OpenStreetMap. Runs on GitHub Actions (see .github/workflows/osm-refresh.yml),
because our build machines can't reach the OpenStreetMap servers.

1. Overpass: every named restaurant, cafe, bar, pub, club, fast food, hotel and apartment in the Republic.
2. Match our register records to them, by phone first, then by name near the record's town.
3. Anything still unpinned with an address: Nominatim, street then postcode (approximate pins), cached, 1 request a second.

Writes data/work/osm_pins.json, data/work/osm_hotel_gaps.json and data/work/nominatim_cache.json.
OpenStreetMap data (c) OpenStreetMap contributors, ODbL.
"""
import json, math, os, re, statistics, sys, time, unicodedata, urllib.parse, urllib.request

UA = "welovecy.com map refresh (https://www.welovecy.com)"
BBOX = (34.55, 32.25, 35.2, 34.1)
CACHE = "data/work/nominatim_cache.json"
VENUE_T = {"restaurant", "cafe", "bar", "pub", "nightclub", "fast_food", "ice_cream", "biergarten", "beach_resort"}
HOTEL_T = {"hotel", "apartment", "guest_house", "hostel", "motel", "chalet"}
STOP = r"\b(restaurant|restaurants|resto|taverna|tavern|tavernaki|cafe|caffe|coffee|bar|pub|snack|snackbar|grill|house|the|and|beach|hotel|hotels|apartments|apts|apartment|resort|suites|ltd)\b"

def km(a, b):
    r = math.pi / 180
    x = (b[1] - a[1]) * r * math.cos((a[0] + b[0]) / 2 * r); y = (b[0] - a[0]) * r
    return math.hypot(x, y) * 6371

def norm(s):
    s = unicodedata.normalize("NFD", (s or "").lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn").replace("&", " and ")
    s = re.sub(STOP, " ", s)
    return re.sub(r"[^a-z0-9α-ω]+", "", s)

def http(url, data=None, timeout=180):
    req = urllib.request.Request(url, data=data, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))

def geofabrik():
    """The whole-island extract from Geofabrik, read locally with pyosmium. Steadier than Overpass."""
    import osmium
    path = "/tmp/cyprus.osm.pbf"
    req = urllib.request.Request("https://download.geofabrik.de/europe/cyprus-latest.osm.pbf", headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=300) as r, open(path, "wb") as f: f.write(r.read())
    want = lambda t: t.get("amenity") in VENUE_T or t.get("tourism") in HOTEL_T or t.get("leisure") == "beach_resort"
    out = []
    def add(kind, oid, t, lat, lon):
        if not (t.get("name") or t.get("name:en")): return
        if not (BBOX[0] <= lat <= BBOX[2] and BBOX[1] <= lon <= BBOX[3]): return
        out.append({"id": f"{kind}{oid}", "n": t.get("name", ""), "en": t.get("name:en", ""), "el": t.get("name:el", ""),
                    "t": t.get("amenity") if t.get("amenity") in VENUE_T else t.get("tourism") or t.get("leisure"), "cu": t.get("cuisine", ""),
                    "ll": [round(lat, 5), round(lon, 5)], "ph": re.sub(r"\D", "", t.get("phone") or t.get("contact:phone") or "")[-8:],
                    "st": t.get("stars", ""), "web": t.get("website") or t.get("contact:website") or ""})
    class H(osmium.SimpleHandler):
        def node(self, n):
            t = dict(n.tags)
            if want(t) and n.location.valid(): add("n", n.id, t, n.location.lat, n.location.lon)
        def way(self, w):
            t = dict(w.tags)
            if not want(t): return
            pts = [(x.location.lat, x.location.lon) for x in w.nodes if x.location.valid()]
            if pts: add("w", w.id, t, sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts))
    H().apply_file(path, locations=True)
    print(f"geofabrik: {len(out)} named places")
    return out

def overpass():
    q = (f"[out:json][timeout:180];("
         f'nwr["amenity"~"^(restaurant|cafe|bar|pub|nightclub|fast_food|ice_cream|biergarten)$"]{BBOX};'
         f'nwr["tourism"~"^(hotel|apartment|guest_house|hostel|motel|chalet)$"]{BBOX};'
         f'nwr["leisure"="beach_resort"]{BBOX};);out center tags;').replace("(34.55, 32.25, 35.2, 34.1)", "(34.55,32.25,35.2,34.1)")
    for host in ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter"]:
        try:
            j = http(host, urllib.parse.urlencode({"data": q}).encode())
            out = []
            for e in j["elements"]:
                t = e.get("tags", {})
                lat = e.get("lat") or e.get("center", {}).get("lat"); lon = e.get("lon") or e.get("center", {}).get("lon")
                if lat is None or not (t.get("name") or t.get("name:en")): continue
                out.append({"id": f"{e['type'][0]}{e['id']}", "n": t.get("name", ""), "en": t.get("name:en", ""), "el": t.get("name:el", ""),
                            "t": t.get("amenity") or t.get("tourism") or t.get("leisure"), "cu": t.get("cuisine", ""),
                            "ll": [round(lat, 5), round(lon, 5)], "ph": re.sub(r"\D", "", t.get("phone") or t.get("contact:phone") or "")[-8:],
                            "st": t.get("stars", ""), "web": t.get("website") or t.get("contact:website") or ""})
            print(f"overpass: {len(out)} named places from {host}")
            return out
        except Exception as ex:
            print(f"overpass {host} failed: {ex}")
    sys.exit("overpass unavailable")

def main():
    biz = json.load(open("data/businesses.json", encoding="utf-8"))
    try:
        osm = geofabrik()
    except Exception as ex:
        print("geofabrik failed, trying overpass:", ex); osm = overpass()
    for o in osm: o["k"] = [k for k in {norm(o["n"]), norm(o["en"]), norm(o["el"])} if len(k) >= 3]
    by_ph = {}
    for o in osm:
        if len(o["ph"]) == 8: by_ph.setdefault(o["ph"], []).append(o)
    # rough town centres from what we've already mapped
    pts = {}
    for b in biz:
        if b.get("ll") and b.get("tw"): pts.setdefault(b["tw"], []).append(b["ll"])
    tc = {t: [statistics.median(p[0] for p in v), statistics.median(p[1] for p in v)] for t, v in pts.items()}

    pins, used = {}, set()
    for b in biz:
        isv, ish = b["g"] in ("eat", "cafe", "night"), b["g"] in ("hotel", "apart")
        if not (isv or ish): continue
        kinds = VENUE_T if isv else HOTEL_T
        centre = b.get("ll") or tc.get(b.get("tw"))
        ph = re.sub(r"\D", "", b.get("p", ""))[-8:]
        hit, how = None, ""
        cands = [o for o in by_ph.get(ph, []) if o["t"] in kinds] if len(ph) == 8 else []
        if cands:
            hit = min(cands, key=lambda o: km(centre, o["ll"])) if centre else cands[0]
            how = "osm-phone"
            if centre and km(centre, hit["ll"]) > 15: hit = None
        nk = norm(b["n"])
        if not hit and len(nk) >= 3 and centre:
            radius = 0.3 if b.get("ll") else 4
            c = [o for o in osm if o["t"] in kinds and km(centre, o["ll"]) <= radius and
                 any(k == nk or (len(nk) >= 5 and len(k) >= 5 and (k in nk or nk in k)) for k in o["k"])]
            if c: hit, how = min(c, key=lambda o: km(centre, o["ll"])), "osm-name"
        if hit:
            used.add(hit["id"])
            p = {"how": how, "osm": hit["id"], "t": hit["t"]}
            if not b.get("ll"): p["ll"] = hit["ll"]
            if hit["cu"]: p["cu"] = hit["cu"]
            if hit["st"]: p["stars"] = hit["st"]
            pins[b["i"]] = p
    print(f"matched to OpenStreetMap: {len(pins)} ({sum(1 for p in pins.values() if 'll' in p)} new pins)")

    # Nominatim for the rest: street near the postcode, else the postcode centre. Both approximate.
    cache = json.load(open(CACHE, encoding="utf-8")) if os.path.exists(CACHE) else {}
    last = [0.0]
    def nom(params):
        key = urllib.parse.urlencode(sorted(params.items()))
        if key in cache: return cache[key]
        wait = 1.1 - (time.time() - last[0])
        if wait > 0: time.sleep(wait)
        try:
            res = http("https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=cy&" + key, timeout=60)
            res = [[round(float(x["lat"]), 5), round(float(x["lon"]), 5)] for x in res]
        except Exception as ex:
            print("nominatim error", ex); res = None
        last[0] = time.time()
        if res is not None: cache[key] = res
        return res or []
    todo = [b for b in biz if b["g"] in ("eat", "cafe", "night", "hotel", "apart") and not b.get("ll") and "ll" not in pins.get(b["i"], {}) and b.get("a")]
    print(f"geocoding {len(todo)} addresses")
    for n, b in enumerate(todo):
        centre = tc.get(b.get("tw"))
        parts = [x.strip() for x in b["a"].split(",") if x.strip()]
        pc = (re.search(r"\b(\d{4})\b", b["a"]) or [None, None])[1]
        street = next((x for x in parts if not re.fullmatch(r"\d+\s*[a-zα-ω]?'?", x, re.I) and not re.fullmatch(r"\d{4}", x)), "")
        street = re.sub(r"^(οδος|οδός|λεωφορος|λεωφόρος)\s+", "", street, flags=re.I)
        street = re.sub(r"\s*αρ\.?\s*\d+.*$", "", street, flags=re.I); street = re.sub(r"\s+\d{4}.*$", "", street).strip()
        city = b.get("tw") or parts[-1]
        pcp = None
        if pc:
            r = nom({"limit": "1", "postalcode": pc})
            if r and (not centre or km(centre, r[0]) <= 10): pcp = r[0]
        best, how = None, ""
        if len(street) > 3:
            anchor = pcp or centre
            r = [p for p in nom({"limit": "5", "street": street, "city": city}) if not anchor or km(anchor, p) < 6]
            if r: best, how = (min(r, key=lambda p: km(anchor, p)) if anchor else r[0]), "street"
        if not best and pcp: best, how = pcp, "postcode"
        if best: pins.setdefault(b["i"], {})["ll"] = best; pins[b["i"]]["how"] = how
        if n % 100 == 0:
            print(f"  {n}/{len(todo)}"); json.dump(cache, open(CACHE, "w", encoding="utf-8"), ensure_ascii=False)
    json.dump(cache, open(CACHE, "w", encoding="utf-8"), ensure_ascii=False)

    json.dump(pins, open("data/work/osm_pins.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0, sort_keys=True)
    gaps = [{"osm": o["id"], "n": o["n"], "en": o["en"], "t": o["t"], "stars": o["st"], "ll": o["ll"], "web": o["web"]}
            for o in osm if o["t"] in ("hotel", "apartment") and o["id"] not in used]
    json.dump(sorted(gaps, key=lambda g: g["ll"]), open("data/work/osm_hotel_gaps.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    from collections import Counter
    print("pins by method:", Counter(p["how"] for p in pins.values() if "ll" in p))
    print(f"hotels on OpenStreetMap not matched to the register: {len(gaps)}")

if __name__ == "__main__":
    main()
