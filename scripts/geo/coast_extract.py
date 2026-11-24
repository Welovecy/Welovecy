"""Coastline lines from OpenStreetMap for a small box, for map graphics. Usage: coast_extract.py minlon minlat maxlon maxlat out.json"""
import sys, json, urllib.request, osmium
lo1, la1, lo2, la2 = map(float, sys.argv[1:5]); out = sys.argv[5]
pbf = "cyprus.osm.pbf"
urllib.request.urlretrieve("https://download.geofabrik.de/europe/cyprus-latest.osm.pbf", pbf)
lines = []
class H(osmium.SimpleHandler):
    def way(self, w):
        if w.tags.get("natural") != "coastline": return
        pts = [(n.lon, n.lat) for n in w.nodes if n.location.valid()]
        if any(lo1 <= x <= lo2 and la1 <= y <= la2 for x, y in pts): lines.append(pts)
H().apply_file(pbf, locations=True)
json.dump(lines, open(out, "w"))
print(len(lines), "lines", sum(map(len, lines)), "points")
