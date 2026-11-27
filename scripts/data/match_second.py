"""Second pin pass (27 Nov 2026): match records with no pin, or only a rough one (pr approx or area), to the newest
Overture Maps places (CDLA Permissive 2.0) by registered phone first, then by name.

Rough pins tell us roughly where the place is, so a match must sit near it: within 1.5 km of a street-level
pin (approx), 4 km of a town-level one (area). Records with no pin use their town, as in match_overture.py.
Never north of the line. Writes data/work/overture_pins2.json, read by apply_pins.py.

Usage: python3 scripts/data/match_second.py data/work/overture_places.json
"""
import collections, json, statistics, sys
sys.path.insert(0, "scripts/data")
from match_overture import CATS, DEST_CENTRE, group_of, km, sim, toks
from match_phone import in_republic, ph8

def main(path):
    places = [p for p in json.load(open(path, encoding="utf-8")) if p.get("n") and p.get("ll") and in_republic(p["ll"])]
    biz = json.load(open("data/businesses.json", encoding="utf-8"))
    pois = json.load(open("data/pois.json", encoding="utf-8"))
    pts = collections.defaultdict(list)
    for r in biz + pois:
        if r.get("ll") and not r.get("pr") and r.get("tw") and r["tw"] != "Not specified": pts[r["tw"]].append(r["ll"])
    centres = {t: [statistics.median(p[0] for p in v), statistics.median(p[1] for p in v)] for t, v in pts.items() if len(v) >= 3}
    by_cat = collections.defaultdict(list)
    by_phone = collections.defaultdict(list)
    for p in places:
        cat = f"{p.get('cat') or ''} {p.get('tax') or ''}"
        for g, rx in CATS.items():
            if rx.search(cat): by_cat[g].append(p)
        n = ph8(p.get("ph"))
        if n: by_phone[n].append(p)
    recs = [r for r in biz] + [r for r in pois if r.get("k") in ("pharmacy", "market", "health")]
    recs = [r for r in recs if not r.get("ll") or r.get("pr") in ("approx", "area")]
    out, stats = {}, collections.Counter()
    for r in recs:
        g = group_of(r)
        tw = r.get("tw") if r.get("tw") not in (None, "", "Not specified") else None
        if r.get("ll"):
            centre, radius = r["ll"], 1.5 if r.get("pr") == "approx" else 2.5
        else:
            centre = centres.get(tw) or DEST_CENTRE[r["d"]]
            radius = 7 if tw in centres else 25
        # 1. phone: the register and the map listing share it
        hit, how = None, ""
        n = ph8(r.get("p") or r.get("ph"))
        if n and by_phone.get(n):
            cands = [p for p in by_phone[n] if km(p["ll"], centre) <= max(radius, 6)]
            # same number, and the names must also look alike: owners share numbers across their venues
            if cands and max(km(a["ll"], b["ll"]) for a in cands for b in cands) <= 0.2 and sim(r["n"], cands[0]["n"], tw or "") >= 0.3:
                hit, how = cands[0], "phone"
        # 2. name, as match_overture.py
        if not hit:
            best, bs = None, 0.0
            for p in by_cat.get(g, []):
                if km(p["ll"], centre) > radius: continue
                s = sim(r["n"], p["n"], tw or "")
                if g in ("market", "pharmacy") and s >= 0.6 and r.get("a"):
                    if not p.get("addr") or not (toks(r["a"]) & toks(p["addr"])): s = 0.0
                if s > bs or (s == bs and best and (p.get("conf") or 0) > (best.get("conf") or 0)): best, bs = p, s
            ok = best is not None and bs >= 0.6 and (best.get("conf") or 0) >= 0.5
            if ok and len(toks(r["n"]) - toks(tw or "")) == 1:
                rivals = [p for p in by_cat.get(g, []) if km(p["ll"], centre) <= radius and sim(r["n"], p["n"], tw or "") >= bs - 0.01]
                ok = len({p["id"] for p in rivals}) == 1
            if ok: hit, how = best, f"name {bs:.2f}"
        key = ("upgrade" if r.get("ll") else "new", g)
        if not hit: stats["miss", *key] += 1; continue
        stats["hit", *key] += 1
        out[r["i"]] = {"ll": hit["ll"], "ov": hit["id"], "on": hit["n"], "how": how, "was": r.get("pr") or "none",
                       "moved_m": round(km(hit["ll"], r["ll"]) * 1000) if r.get("ll") else None}
    for k, v in sorted(stats.items()): print(" ".join(k), v)
    json.dump(out, open("data/work/overture_pins2.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print("pins", len(out))

if __name__ == "__main__":
    main(sys.argv[1])
