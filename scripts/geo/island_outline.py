"""The whole coastline of Cyprus from OpenStreetMap, joined into rings and simplified, for the small island map.
Usage: island_outline.py out.json"""
import sys, json, math, urllib.request, osmium
out = sys.argv[1]
pbf = "cyprus.osm.pbf"
urllib.request.urlretrieve("https://download.geofabrik.de/europe/cyprus-latest.osm.pbf", pbf)
ways = []
class H(osmium.SimpleHandler):
    def way(self, w):
        if w.tags.get("natural") == "coastline":
            ways.append([(n.ref, n.lon, n.lat) for n in w.nodes if n.location.valid()])
H().apply_file(pbf, locations=True)
# join ways into chains: start from ways nothing leads into, then the leftover loops
by_start = {w[0][0]: i for i, w in enumerate(ways)}
has_prev = {by_start[w[-1][0]] for w in ways if w[-1][0] in by_start}
used, rings = set(), []
order = [i for i in range(len(ways)) if i not in has_prev] + list(range(len(ways)))
for i in order:
    if i in used: continue
    ring = list(ways[i]); used.add(i)
    while ring[-1][0] != ring[0][0]:
        j = by_start.get(ring[-1][0])
        if j is None or j in used: break
        ring += ways[j][1:]; used.add(j)
    rings.append([(x, y) for _, x, y in ring])
def dp(pts, eps):
    if len(pts) < 3: return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1; L = math.hypot(dx, dy) or 1e-12
    i, dmax = 0, 0.0
    for k in range(1, len(pts) - 1):
        d = abs(dy * pts[k][0] - dx * pts[k][1] + x2 * y1 - y2 * x1) / L
        if d > dmax: i, dmax = k, d
    if dmax <= eps: return [pts[0], pts[-1]]
    return dp(pts[: i + 1], eps)[:-1] + dp(pts[i:], eps)
sys.setrecursionlimit(100000)
def area(r): return abs(sum(r[i][0] * r[i - 1][1] - r[i - 1][0] * r[i][1] for i in range(len(r)))) / 2
rings.sort(key=area, reverse=True)
keep = [r for r in rings if area(r) > 0.0004 or len(r) > 2000]
res = {eps: [[[round(x, 4), round(y, 4)] for x, y in dp(r, eps)] for r in keep] for eps in (0.002, 0.004)}
json.dump({"source": "OpenStreetMap contributors (ODbL), natural=coastline", "rings": len(rings), "kept": len(keep),
           "fine": res[0.002], "coarse": res[0.004]}, open(out, "w"))
print(len(ways), "ways", len(rings), "rings", len(keep), "kept", sum(len(r) for r in res[0.002]), "points")
