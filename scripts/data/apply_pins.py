"""Add Overture Maps pins to records that have no location yet, and put mis-filed records in the right area.

Runs after build_businesses.py and build_essentials.py (see `npm run data`).
"""
import json, collections, os

def main():
    pins = json.load(open("data/work/overture_pins.json", encoding="utf-8")) if os.path.exists("data/work/overture_pins.json") else {}
    biz = json.load(open("data/businesses.json", encoding="utf-8"))
    pois = json.load(open("data/pois.json", encoding="utf-8"))
    added = 0
    for r in biz + pois:
        p = pins.get(r["i"])
        if p and not r.get("ll"):
            r["ll"] = p["ll"]; r["ls"] = "ov"; added += 1
    # same rule as build_businesses.py: Paralimni addresses on the coast are Protaras to a visitor
    relabel = 0
    for r in biz + pois:
        if r.get("ls") == "ov" and r.get("tw") == "Paralimni" and r["ll"][1] >= 34.03:
            r["tw"] = "Protaras"; relabel += 1
    # area by town majority: a hotel in Ayia Napa filed on the Nicosia tab moves to Ayia Napa
    votes = collections.defaultdict(collections.Counter)
    for r in biz + pois:
        if r.get("tw") and r["tw"] != "Not specified": votes[r["tw"]][r["d"]] += 1
    # villages that share a name across districts stay where the register filed them
    ambiguous = {"Episkopi", "Pyrgos", "Kalavasos", "Agios Georgios", "Agios Theodoros", "Agia Marina", "Not specified"}
    moved = 0
    for r in biz + pois:
        if r.get("tw") in ambiguous: continue
        v = votes.get(r.get("tw"))
        if v and len(v) > 1:
            top, n = v.most_common(1)[0]
            if top != r["d"] and n >= 5 and v[r["d"]] <= 2:
                r["d"] = top; moved += 1
    json.dump(biz, open("data/businesses.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    json.dump(pois, open("data/pois.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"pins added {added} · relabelled Protaras {relabel} · records moved to the right area {moved}")

if __name__ == "__main__":
    main()
