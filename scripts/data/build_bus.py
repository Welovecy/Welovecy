"""Build data/bus.json from data/source/bus-routes-and-airport-services.xlsx.

Source: Republic of Cyprus, Public Works Department, via Motion Bus Card open data (CC BY 4.0),
feeds dated 20 November 2026. Transformations: routes with no upcoming trips are dropped, stops
shared by two operators at the same spot are merged, region names are shortened for display.
"""
import json, math, re, openpyxl

SRC = "data/source/bus-routes-and-airport-services.xlsx"
REGION = {  # display names; the service area is described by the towns it serves
    "Famagusta — government-controlled area": "Ayia Napa, Protaras and Paralimni",
    "Intercity": "Intercity", "Larnaca": "Larnaca", "Limassol": "Limassol", "Nicosia": "Nicosia", "Paphos": "Paphos",
}

def rows(ws, header_row=5):
    it = ws.iter_rows(min_row=header_row)
    head = [c.value for c in next(it)]
    for row in it:
        if row[0].value is None: continue
        yield {h: c for h, c in zip(head, row) if h}

def val(c): return c.value if c is not None else None
FORMULAS = {}
def link(c):
    if c is None: return None
    if c.hyperlink: return c.hyperlink.target
    f = FORMULAS.get((c.parent.title, c.coordinate))
    m = re.match(r'=HYPERLINK\("([^"]+)"', f or "")
    return m.group(1) if m else None
def clean(s): return re.sub(r"\s+", " ", str(s or "")).strip(" -")

def in_republic(lat, lon):
    if lat < 34.55 or lat > 35.25 or lon < 32.25 or lon > 34.6: return False
    if 32.75 <= lon < 33.25 and lat > 35.175: return False
    if 33.25 <= lon < 33.43 and lat > 35.185: return False
    if 33.43 <= lon < 33.95 and lat > 35.14: return False
    if lon >= 33.95 and lat > 35.1: return False
    return True

def main():
    wb = openpyxl.load_workbook(SRC, data_only=True)
    raw = openpyxl.load_workbook(SRC)
    for ws in raw.worksheets:
        for row in ws.iter_rows():
            for c in row:
                if isinstance(c.value, str) and c.value.startswith("=HYPERLINK"): FORMULAS[(ws.title, c.coordinate)] = c.value
    ops = {}
    for r in rows(wb["Operators and feeds"]):
        ops[val(r["Operator"])] = {"web": link(r["Operator website"]), "ph": clean(val(r["Operator phone"]))}
    routes = {}
    for r in rows(wb["Routes by region"]):
        if val(r["Schedule status"]) != "Scheduled in feed": continue
        region, num = val(r["Network region"]), clean(val(r["Route"]))
        label = clean(val(r["Route label as published"]))
        if len(label) >= 54 and " - " in label:   # the source cuts English labels at 55 characters
            label = label.rsplit(" - ", 1)[0] + " …"
        greek = clean(val(r["Greek route label"]))
        routes[f"{region}|{num}"] = {
            "r": num, "a": REGION[region], "op": val(r["Operator"]), "l": label, "gl": greek,
            "air": clean(val(r["Airport"])) or None, "web": link(r.get("Official timetable")) or None,
            "to": sorted({clean(x) for x in str(val(r["Destination stops across variants"]) or "").split(";") if clean(x)}),
            "from": sorted({clean(x) for x in str(val(r["Origin stops across variants"]) or "").split(";") if clean(x)}),
        }
    stops, skipped = [], 0
    for r in rows(wb["Bus stops"]):
        region = val(r["Network region"])
        lat, lon = float(val(r["Latitude"])), float(val(r["Longitude"]))
        if not in_republic(lat, lon): skipped += 1; continue
        nums = [clean(x) for x in str(val(r["Routes serving stop"]) or "").split(";") if clean(x)]
        keys = [f"{region}|{n}" for n in nums if f"{region}|{n}" in routes]
        if not keys: continue
        stops.append({"i": "bus-" + clean(val(r["Stop key"])).replace(":", "-"), "n": clean(val(r["Stop name"])), "g": clean(val(r["Greek stop name"])),
                      "ll": [round(lat, 6), round(lon, 6)], "rk": keys})
    # merge the same physical stop listed by two operators (same name within 25 m)
    merged, by_cell = [], {}
    for s in stops:
        cell = (round(s["ll"][0], 3), round(s["ll"][1], 3), s["n"].lower())
        m = by_cell.get(cell)
        if m and math.dist(m["ll"], s["ll"]) < 0.00025:
            m["rk"] = sorted(set(m["rk"]) | set(s["rk"]))
            continue
        by_cell[cell] = s; merged.append(s)
    airport = []
    for r in rows(wb["Airport services"]):
        airport.append({"air": clean(val(r["Airport"])), "op": clean(val(r["Operator"])), "type": clean(val(r["Service type"])),
                        "route": clean(val(r["Route / connection"])), "num": clean(val(r["Public route"])) if val(r["Public route"]) not in (None, "None") else None,
                        "change": clean(val(r["Connection required?"])), "board": clean(val(r["Boarding information"])),
                        "web": link(r["Official timetable"]), "book": link(r["Booking page"]), "ph": clean(val(r["Operator phone"]))})
    out = {"routes": routes, "stops": merged, "ops": ops, "airport": airport,
           "source": {"t": "Public Works Department, Republic of Cyprus, via Motion Bus Card open data (CC BY 4.0)", "u": "https://www.motionbuscard.org.cy/opendata", "date": "2026-11-20"}}
    json.dump(out, open("data/bus.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"routes {len(routes)} · stops {len(merged)} (merged from {len(stops)}, outside scope {skipped}) · airport services {len(airport)}")

if __name__ == "__main__":
    main()
