"""
Attractions from OpenStreetMap, with their visitor entrances. Runs on GitHub Actions (attractions.yml),
because our build machines can't reach the OpenStreetMap servers. Output: attractions.json on the `osm-attractions` branch.

Picks named museums, galleries, zoos, aquariums, theme and water parks, theatres, arts centres, planetariums,
viewpoints, waterfalls, malls, marinas, parks with a visitor centre, ski areas and similar, inside the Republic.
For areas (ways and relations) it records the centre and every entrance node on the outline (entrance=main first).
OpenStreetMap data (c) OpenStreetMap contributors, ODbL.
"""
import json, sys, urllib.request
import osmium

UA = "welovecy.com attractions extract (https://www.welovecy.com)"
BBOX = (34.55, 32.25, 35.2, 34.1)
TOURISM = {"museum", "gallery", "zoo", "aquarium", "theme_park", "attraction", "viewpoint", "artwork", "information"}
AMENITY = {"theatre", "arts_centre", "planetarium", "cinema", "events_venue", "marketplace", "music_venue", "nightclub"}
LEISURE = {"water_park", "park", "nature_reserve", "marina", "amusement_arcade", "sports_centre", "stadium", "garden", "beach_resort"}
SHOP = {"mall", "department_store"}
NATURAL = {"waterfall", "cave_entrance"}

def want(t):
    if not (t.get("name") or t.get("name:en")): return None
    if t.get("tourism") in TOURISM and t.get("tourism") != "information": return "tourism=" + t["tourism"]
    if t.get("tourism") == "information" and t.get("information") == "office": return "visitor_centre"
    if t.get("amenity") in AMENITY: return "amenity=" + t["amenity"]
    if t.get("leisure") in LEISURE: return "leisure=" + t["leisure"]
    if t.get("shop") in SHOP: return "shop=" + t["shop"]
    if t.get("natural") in NATURAL: return "natural=" + t["natural"]
    if t.get("historic") in {"castle", "monument", "archaeological_site", "wreck", "ruins", "fort"}: return "historic=" + t["historic"]
    if t.get("landuse") == "winter_sports" or t.get("piste:type"): return "winter_sports"
    return None

def inside(lat, lon): return BBOX[0] <= lat <= BBOX[2] and BBOX[1] <= lon <= BBOX[3]

def main(out):
    path = "/tmp/cyprus.osm.pbf"
    req = urllib.request.Request("https://download.geofabrik.de/europe/cyprus-latest.osm.pbf", headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=300) as r, open(path, "wb") as f: f.write(r.read())

    # pass 1: entrance nodes
    entrances = {}
    class E(osmium.SimpleHandler):
        def node(self, n):
            t = dict(n.tags)
            if "entrance" in t and n.location.valid():
                entrances[n.id] = {"ll": [round(n.location.lat, 6), round(n.location.lon, 6)], "e": t["entrance"], "n": t.get("name", "")}
    E().apply_file(path)

    items = []
    def rec(kind, oid, t, lat, lon, ents):
        k = want(t)
        if not k or not inside(lat, lon): return
        items.append({"id": f"{kind}{oid}", "k": k, "n": t.get("name", ""), "en": t.get("name:en", ""), "el": t.get("name:el", ""),
                      "ll": [round(lat, 6), round(lon, 6)], "ent": ents[:6], "web": t.get("website") or t.get("contact:website") or "",
                      "ph": t.get("phone") or t.get("contact:phone") or "", "oh": t.get("opening_hours", ""),
                      "addr": " ".join(x for x in [t.get("addr:street", ""), t.get("addr:housenumber", ""), t.get("addr:city", "")] if x),
                      "op": t.get("operator", ""), "wd": t.get("wikidata", "")})
    class H(osmium.SimpleHandler):
        def node(self, n):
            if n.location.valid(): rec("n", n.id, dict(n.tags), n.location.lat, n.location.lon, [])
        def way(self, w):
            t = dict(w.tags)
            if not want(t): return
            pts = [(x.location.lat, x.location.lon) for x in w.nodes if x.location.valid()]
            if not pts: return
            ents = [entrances[x.ref] for x in w.nodes if x.ref in entrances]
            ents.sort(key=lambda e: 0 if e["e"] == "main" else 1 if e["e"] in ("yes", "visitor") else 2)
            rec("w", w.id, t, sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts), ents)
    H().apply_file(path, locations=True)
    json.dump({"source": "OpenStreetMap contributors (ODbL), Geofabrik extract", "items": items}, open(out, "w"), ensure_ascii=False)
    print(len(items), "attractions")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "attractions.json")
