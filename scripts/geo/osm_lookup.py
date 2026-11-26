"""
Find named features in OpenStreetMap by name, whatever their tags. Runs on GitHub Actions (osm-lookup.yml)
because our build machines can't reach the OpenStreetMap servers.
Usage: python3 osm_lookup.py "planetarium|technopolis|lykourg" out.json
Matches name, name:en, name:el and alt_name (case and accents ignored). Areas get their centre and entrances.
OpenStreetMap data (c) OpenStreetMap contributors, ODbL.
"""
import json, re, sys, unicodedata, urllib.request
import osmium

UA = "welovecy.com name lookup (https://www.welovecy.com)"
def fold(s):
    s = unicodedata.normalize("NFD", (s or "").lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")

def main(pattern, out):
    rx = re.compile(fold(pattern))
    path = "/tmp/cyprus.osm.pbf"
    req = urllib.request.Request("https://download.geofabrik.de/europe/cyprus-latest.osm.pbf", headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=300) as r, open(path, "wb") as f: f.write(r.read())
    ents = {}
    class E(osmium.SimpleHandler):
        def node(self, n):
            if "entrance" in n.tags and n.location.valid(): ents[n.id] = {"ll": [round(n.location.lat, 6), round(n.location.lon, 6)], "e": n.tags["entrance"]}
    E().apply_file(path)
    hits = []
    def names(t): return " | ".join(t.get(k, "") for k in ("name", "name:en", "name:el", "alt_name", "old_name") if t.get(k))
    def keep(kind, oid, t, ll, e):
        nm = names(t)
        if nm and rx.search(fold(nm)):
            hits.append({"id": f"{kind}{oid}", "names": nm, "ll": ll, "ent": e[:4], "tags": {k: v for k, v in t.items() if not k.startswith(("source", "note"))}})
    class H(osmium.SimpleHandler):
        def node(self, n):
            if n.location.valid() and "name" in n.tags: keep("n", n.id, dict(n.tags), [round(n.location.lat, 6), round(n.location.lon, 6)], [])
        def way(self, w):
            if "name" not in w.tags: return
            pts = [(x.location.lat, x.location.lon) for x in w.nodes if x.location.valid()]
            if not pts: return
            e = [ents[x.ref] for x in w.nodes if x.ref in ents]
            e.sort(key=lambda z: 0 if z["e"] == "main" else 1)
            keep("w", w.id, dict(w.tags), [round(sum(p[0] for p in pts) / len(pts), 6), round(sum(p[1] for p in pts) / len(pts), 6)], e)
    H().apply_file(path, locations=True)
    json.dump({"pattern": pattern, "hits": hits}, open(out, "w"), ensure_ascii=False, indent=1)
    print(len(hits), "matches")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "lookup.json")
