"""
Build data/duty.json from the Ministry of Health's duty pharmacy rota
(gov.cy/moh-phs/documents/diimereyonta-farmakeia/), one Excel file per district.

Put the files in data/raw/duty/<district>-<season>.xls[x] and run:  python3 scripts/content/duty.py
Only the pharmacy's own phone is kept. The rota's home phone column is never read.
Each rota row is matched to our pharmacy register by its licence number (AM) for map position and page link.
"""
import datetime, glob, json, os, re, sys
import statistics
import xlrd, openpyxl
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from duty_towns import TOWNS, FIXED

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, "data", "raw", "duty")
EPOCH = datetime.date(1899, 12, 30)
DISTRICTS = ["famagusta", "larnaca", "limassol", "nicosia", "paphos"]
# Fixed public holidays in the rota seasons (duty hours are 08:00 to 22:00 on these, as on Sundays).
HOLIDAYS = ["2026-10-01", "2026-10-28", "2026-12-25", "2026-12-26", "2027-01-01", "2027-01-06",
            "2027-03-15", "2027-03-25", "2027-04-01", "2027-04-30", "2027-05-01", "2027-05-03"]

def rows(path):
    if path.endswith(".xlsx"):
        ws = openpyxl.load_workbook(path, data_only=True, read_only=True).worksheets[0]
        return [list(r) for r in ws.iter_rows(values_only=True)]
    s = xlrd.open_workbook(path).sheet_by_index(0)
    return [s.row_values(i) for i in range(s.nrows)]

def day(v):
    if isinstance(v, datetime.datetime): return v.date()
    if isinstance(v, (int, float)) and 40000 < v < 60000: return EPOCH + datetime.timedelta(days=int(v))
    return None

def clean(v):
    s = "" if v is None else str(v).strip()
    if s in ("0", "0.0", "None"): return ""
    s = re.sub(r"\.0$", "", s)
    return re.sub(r"\s+", " ", s)

def phone(v):
    p = re.sub(r"\D", "", clean(v))
    return p if len(p) == 8 else ""

pois = json.load(open(os.path.join(ROOT, "data", "pois.json")))
by_reg = {str(p.get("reg")): p for p in pois if p["k"] == "pharmacy" and p.get("reg")}
# A rough centre for each town, from everything we have mapped there, for pharmacies without an exact pin.
pts = {}
for x in pois + json.load(open(os.path.join(ROOT, "data", "businesses.json"))):
    if x.get("ll") and x.get("tw"): pts.setdefault(x["tw"].lower(), []).append(x["ll"])
def centre(en):
    if en in FIXED: return FIXED[en]
    p = pts.get(en.lower(), [])
    if not p: return None
    return [round(statistics.median(c[0] for c in p), 4), round(statistics.median(c[1] for c in p), 4)]
missing = sorted({g for g in TOWNS if not centre(TOWNS[g])})
if missing: sys.exit(f"no centre for towns: {missing}")

out = {"source": "https://www.gov.cy/moh-phs/documents/diimereyonta-farmakeia/", "built": datetime.date.today().isoformat(),
       "holidays": HOLIDAYS, "d": {}}
first, last, matched, total = None, None, 0, 0
for dist in DISTRICTS:
    files = sorted(glob.glob(os.path.join(RAW, f"{dist}-*.xls*")))
    if not files: sys.exit(f"missing rota for {dist}")
    days = {}
    for f in files:
        for r in rows(f)[1:]:
            dt = day(r[0])
            am = clean(r[2])
            if not dt or not am.isdigit(): continue  # header, blank or broken rows
            addr, near, town, ph = clean(r[5]), clean(r[6]), clean(r[7]), phone(r[8])
            if not addr or not town: continue
            if town not in TOWNS: sys.exit(f"add an English name for {town!r} in duty_towns.py")
            item = {"am": am, "a": addr, "t": town, "te": TOWNS[town]}
            if near: item["near"] = near
            if ph: item["ph"] = ph
            p = by_reg.get(am)
            if p:
                item["i"] = p["i"]
                if p.get("ll"): item["ll"] = p["ll"]
                matched += 1
            if "ll" not in item: item["ll"], item["approx"] = centre(TOWNS[town]), 1
            total += 1
            days.setdefault(dt.isoformat(), []).append(item)
    out["d"][dist] = dict(sorted(days.items()))
    ks = list(out["d"][dist])
    first = min(first or ks[0], ks[0]); last = min(last or ks[-1], ks[-1])
out["from"], out["to"] = first, last
json.dump(out, open(os.path.join(ROOT, "data", "duty.json"), "w"), ensure_ascii=False, separators=(",", ":"))
print(f"{total} duty slots, {matched} matched to the register, {first} to {last}")
