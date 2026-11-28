"""Download each official GTFS zip and look inside; find and try the realtime feed. Writes bus_probe/report.json."""
import csv, io, json, os, re, urllib.request, zipfile, datetime
UA = {"User-Agent": "welovecy.com bus data check (welovecy@users.noreply.github.com)"}
FEEDS = {"2": "OSYPA (Paphos)", "4": "OSEA (Famagusta)", "5": "Intercity", "6": "EMEL (Limassol)", "9": "NPT (Nicosia)", "10": "LPT (Larnaca)", "11": "Pame Express"}
os.makedirs("bus_probe", exist_ok=True)
rep = {"checked": datetime.datetime.utcnow().isoformat() + "Z", "static": {}, "realtime": {}}
def get(u, t=90):
    return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=t)
for n, name in FEEDS.items():
    u = f"https://motionbuscard.org.cy/opendata/downloadfile?file=GTFS%5C{n}_google_transit.zip&rel=True"
    r = {"name": name, "url": u}
    try:
        b = get(u).read(); r["bytes"] = len(b)
        z = zipfile.ZipFile(io.BytesIO(b)); r["files"] = {}
        for f in z.namelist():
            with z.open(f) as fh:
                rows = sum(1 for _ in fh) - 1
            r["files"][f] = rows
        def head(f, k=3):
            if f not in z.namelist(): return None
            rd = csv.DictReader(io.TextIOWrapper(z.open(f), "utf-8-sig"))
            return [row for _, row in zip(range(k), rd)]
        r["sample"] = {f: head(f) for f in ["routes.txt", "trips.txt", "stop_times.txt", "calendar.txt", "calendar_dates.txt", "feed_info.txt"]}
        if "calendar.txt" in z.namelist():
            rd = list(csv.DictReader(io.TextIOWrapper(z.open("calendar.txt"), "utf-8-sig")))
            r["calendar_range"] = [min(x["start_date"] for x in rd), max(x["end_date"] for x in rd)]
        open(f"bus_probe/gtfs_{n}.zip", "wb").write(b) if len(b) < 45_000_000 else None
    except Exception as e:
        r["error"] = repr(e)
    rep["static"][n] = r
for key, page in {"gtfs_rt": "https://www.traffic4cyprus.org.cy/en/dataset/publictransportrealtime_gtfs_rt/resource/45cbc7e6-ad11-4b45-9207-3377b8789ffe",
                  "siri": "https://www.traffic4cyprus.org.cy/dataset/publictransportrealtime_siri"}.items():
    r = {"page": page}
    try:
        html = get(page, 60).read().decode("utf-8", "ignore")
        links = sorted(set(re.findall(r'href="(https?://[^"]+)"', html)))
        r["links"] = [l for l in links if not re.search(r"traffic4cyprus\.org\.cy/(en/)?(dataset|organization|group|user|about|api/3|feeds)|facebook|twitter|linkedin|ckan", l)][:40]
        r["text"] = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html))[:3000]
        for l in r["links"]:
            if re.search(r"gtfs|realtime|rt|siri|feed|vehicle|trip", l, re.I):
                try:
                    resp = get(l, 30); body = resp.read(200000)
                    r.setdefault("tries", []).append({"url": l, "status": resp.status, "type": resp.headers.get("content-type"), "bytes": len(body), "head": body[:200].hex() if b"<" not in body[:50] else body[:300].decode("utf-8", "ignore")})
                except Exception as e:
                    r.setdefault("tries", []).append({"url": l, "error": repr(e)[:200]})
    except Exception as e:
        r["error"] = repr(e)
    rep["realtime"][key] = r
json.dump(rep, open("bus_probe/report.json", "w"), indent=1, ensure_ascii=False)
print(json.dumps({k: {"bytes": v.get("bytes"), "files": v.get("files"), "range": v.get("calendar_range"), "error": v.get("error")} for k, v in rep["static"].items()}, indent=1))
