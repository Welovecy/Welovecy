"""
Petrol stations, car hire offices and EV chargers from OpenStreetMap. Runs on GitHub Actions (motoring.yml),
because our build machines can't reach the OpenStreetMap servers. Output: motoring.json on the `osm-motoring` branch.
Inside the bounding box only; the build step drops anything north of the line.
OpenStreetMap data (c) OpenStreetMap contributors, ODbL.
"""
import json, sys, urllib.request
import osmium

UA = "welovecy.com motoring extract (https://www.welovecy.com)"
BBOX = (34.55, 32.25, 35.2, 34.1)
KINDS = {"fuel": "fuel", "car_rental": "car_rental", "charging_station": "charging"}
KEEP = ["name", "name:en", "name:el", "brand", "operator", "opening_hours", "website", "contact:website", "phone", "contact:phone",
        "addr:street", "addr:housenumber", "addr:city", "addr:postcode", "fuel:octane_95", "fuel:octane_98", "fuel:diesel", "fuel:lpg",
        "fuel:adblue", "self_service", "automated", "payment:cards", "shop", "car_wash", "compressed_air", "capacity", "socket:type2",
        "socket:type2_combo", "socket:chademo", "access", "fee", "level", "airport"]

def kind(t):
    k = KINDS.get(t.get("amenity", ""))
    if not k: return None
    if k != "charging" and not (t.get("name") or t.get("brand") or t.get("operator")): return None
    return k

def inside(lat, lon): return BBOX[0] <= lat <= BBOX[2] and BBOX[1] <= lon <= BBOX[3]

def main(out):
    path = "/tmp/cyprus.osm.pbf"
    req = urllib.request.Request("https://download.geofabrik.de/europe/cyprus-latest.osm.pbf", headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=300) as r, open(path, "wb") as f: f.write(r.read())
    items = []
    def rec(t_kind, oid, t, lat, lon):
        if not inside(lat, lon): return
        items.append({"id": oid, "k": t_kind, "ll": [round(lat, 6), round(lon, 6)], "tags": {k: t[k] for k in KEEP if k in t}})
    class H(osmium.SimpleHandler):
        def node(self, n):
            t = dict(n.tags); k = kind(t)
            if k and n.location.valid(): rec(k, f"n{n.id}", t, n.location.lat, n.location.lon)
        def way(self, w):
            t = dict(w.tags); k = kind(t)
            if not k: return
            pts = [(x.location.lat, x.location.lon) for x in w.nodes if x.location.valid()]
            if pts: rec(k, f"w{w.id}", t, sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts))
    H().apply_file(path, locations=True)
    json.dump({"source": "OpenStreetMap contributors (ODbL), Geofabrik extract", "items": items}, open(out, "w"), ensure_ascii=False)
    from collections import Counter
    print(Counter(i["k"] for i in items))

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "motoring.json")
