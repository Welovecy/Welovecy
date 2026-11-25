"""Coastline and road lines from OpenStreetMap for a small box, for map graphics.
Usage: coast_extract.py minlon minlat maxlon maxlat out.json"""
import sys, json, urllib.request, osmium
lo1, la1, lo2, la2 = map(float, sys.argv[1:5]); out = sys.argv[5]
pbf = "cyprus.osm.pbf"
urllib.request.urlretrieve("https://download.geofabrik.de/europe/cyprus-latest.osm.pbf", pbf)
ROADS = {"motorway", "trunk", "primary", "secondary", "tertiary", "unclassified", "residential", "living_street", "service",
         "motorway_link", "trunk_link", "primary_link", "secondary_link", "tertiary_link", "footway", "path", "pedestrian"}
coast, roads = [], []
inside = lambda pts: any(lo1 <= x <= lo2 and la1 <= y <= la2 for x, y in pts)
class H(osmium.SimpleHandler):
    def way(self, w):
        t = w.tags
        if t.get("natural") == "coastline":
            pts = [(n.lon, n.lat) for n in w.nodes if n.location.valid()]
            if inside(pts): coast.append(pts)
        elif t.get("highway") in ROADS:
            pts = [(round(n.lon, 6), round(n.lat, 6), n.ref) for n in w.nodes if n.location.valid()]
            if inside([(a, b) for a, b, _ in pts]):
                roads.append({"h": t.get("highway"), "n": t.get("name:en") or t.get("name") or "", "ow": t.get("oneway") == "yes", "p": pts})
H().apply_file(pbf, locations=True)
json.dump({"coast": coast, "roads": roads}, open(out, "w"))
print(len(coast), "coast lines", len(roads), "roads")
