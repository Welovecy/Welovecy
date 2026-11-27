"""Check Wikimedia Commons files: licence, author, size, camera location, and a 640px preview.
Reads scripts/content/commons_check.txt (one File: title per line), writes commons_check/info.json and previews."""
import json, os, re, time, urllib.parse, urllib.request
UA = {"User-Agent": "welovecy.com image check (welovecy@users.noreply.github.com)"}
titles = [l.strip() for l in open("scripts/content/commons_check.txt") if l.strip()]
os.makedirs("commons_check/prev", exist_ok=True)
strip = lambda s: re.sub(r"<[^>]+>", "", s or "").strip()
out = {}
for i in range(0, len(titles), 20):
    chunk = titles[i:i + 20]
    q = {"action": "query", "format": "json", "prop": "imageinfo|coordinates", "iiprop": "url|size|extmetadata|mime", "iiurlwidth": "640",
         "titles": "|".join(chunk if all(t.startswith("File:") for t in chunk) else [t if t.startswith("File:") else "File:" + t for t in chunk])}
    j = json.load(urllib.request.urlopen(urllib.request.Request("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(q), headers=UA), timeout=60))
    norm = {n["to"]: n["from"] for n in j["query"].get("normalized", [])}
    for p in j["query"]["pages"].values():
        t = p["title"]; key = norm.get(t, t)
        if "imageinfo" not in p: out[key] = {"missing": True}; continue
        ii = p["imageinfo"][0]; m = ii.get("extmetadata", {})
        g = lambda k: strip(m.get(k, {}).get("value"))
        rec = {"title": t, "page": ii.get("descriptionurl"), "url": ii.get("url"), "thumb": ii.get("thumburl"), "w": ii.get("width"), "h": ii.get("height"),
               "artist": g("Artist"), "credit": g("Credit"), "license": g("LicenseShortName"), "license_url": g("LicenseUrl"), "usage": g("UsageTerms"),
               "attribution_required": g("AttributionRequired"), "restrictions": g("Restrictions"), "desc": g("ImageDescription")[:400], "date": g("DateTimeOriginal"),
               "gps": [g("GPSLatitude"), g("GPSLongitude")], "coords": [[c["lat"], c["lon"]] for c in p.get("coordinates", [])], "categories": g("Categories")[:300]}
        out[key] = rec
        try:
            fn = re.sub(r"[^\w.-]", "_", t[5:])[:80] + ".jpg"
            urllib.request.urlretrieve(rec["thumb"], f"commons_check/prev/{fn}") if False else open(f"commons_check/prev/{fn}", "wb").write(urllib.request.urlopen(urllib.request.Request(rec["thumb"], headers=UA), timeout=60).read())
            rec["prev"] = fn
        except Exception as e:
            rec["prev_error"] = str(e)
        time.sleep(0.3)
json.dump(out, open("commons_check/info.json", "w"), indent=1, ensure_ascii=False)
print(len(out), "files", sum(1 for v in out.values() if v.get("missing")), "missing")
