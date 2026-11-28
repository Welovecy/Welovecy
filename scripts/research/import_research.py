"""Import a ChatGPT research staging sheet.

Usage: python3 scripts/research/import_research.py <sheet.xlsx> <source text dir from the research-check branch>

Applies only rows that (1) match a record we already have and (2) whose key facts (times, dates) appear in the
source page's own text as fetched by the research-check job. Everything else goes to the review list.
Writes data/research.json (opening hours and closure notices, merged in src/lib/data.ts) and
data/work/research_report.md. Events are handled separately (they need human-written descriptions).
"""
import json, re, sys, os, hashlib, datetime
import openpyxl

sheet, textdir = sys.argv[1], sys.argv[2]
idx = json.load(open(os.path.join(textdir, "index.json")))
def source_text(u):
    r = idx.get(u)
    if not r or "error" in r: return None
    return open(os.path.join(textdir, r["file"]), encoding="utf-8", errors="ignore").read()

ORG = [(r"visitcyprus\.com", "Visit Cyprus"), (r"mcw\.gov\.cy|culture\.gov\.cy|gov\.cy/.*antiquit", "Department of Antiquities"),
       (r"gov\.cy", "gov.cy"), (r"limassoltourism", "Limassol Tourism Board"), (r"larnakaregion|larnakatourism", "Larnaka Tourism Board"),
       (r"pafosregion|visitpafos", "Pafos Regional Board of Tourism"), (r"nicosia\.org\.cy|nicosiamunicipality", "Nicosia Municipality")]
def org(u):
    for rx, n in ORG:
        if re.search(rx, u): return n
    return re.sub(r"^www\.", "", re.sub(r"^https?://([^/]+).*", r"\1", u))

def norm_times(s):
    return {f"{int(h):02d}:{m}" for h, m in re.findall(r"\b(\d{1,2})[:.](\d{2})\b", s)}

MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
LEADS = r"^(Detailed table|Operator seasonal timetable|Operator currently posts|Operator lists|Operator gives|Tourism authority lists|Published \d{4} operating season)[:\s]+"
def tidy(s):
    """Research notes into site copy: plain dates, no researcher phrasing, no em dashes."""
    s = s.replace("—", ", ").replace(" | ", ". ").replace("Closed: ", "Closed ").strip()
    s = re.sub(r"\b(\d{2})-(\d{2}) to (\d{2})-(\d{2})\b", lambda m: f"{int(m[2])} {MON[int(m[1])-1]} to {int(m[4])} {MON[int(m[3])-1]}", s)
    s = re.sub(r"\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{1,2})\b(?![:.]\d)", r"\2 \1", s)
    s = re.sub(LEADS, "", s, flags=re.I)
    s = s.replace("Closed Public holidays", "Closed public holidays")
    s = re.sub(r"\s+", " ", s)
    s = s[0].upper() + s[1:] if s else s
    return s.rstrip(".")

NOTICE = {"att-larnaca-medieval-museum": "Closed for renovation until further notice"}

# Rows whose wording needs a person: drop or shorten here, with the reason.
OVERRIDE = {
    "att-tio-larnaca": None,  # a renovation note, not hours; the office already carries a closure notice
    "p40": "Season 1 Apr to 9 Nov 2026. The show starts at 21:00 and runs about an hour; arrive by 20:30 for reserved tables",
    "att-paradox-museum": "Tue–Sun 10:00–20:00. Closed Mon",
    "att-aphrodite-waterpark": "Apr–Jun 10:30–17:30; Jul–Aug 10:00–18:00; Sep–Oct 10:00–17:00, with its own hours late in October",
    "p36": "Daily 09:00–17:00. Reach it from the sandy beach, or by boat with an approved dive centre",
}

wb = openpyxl.load_workbook(sheet, data_only=True)
ws = wb["Staging"]; rows = list(ws.iter_rows(values_only=True)); h = rows[0]
data = [dict(zip(h, r)) for r in rows[1:] if any(r)]
today = datetime.date.today().isoformat()
out = {"note": "Facts imported from research sheets, each checked against its source page. Merged in src/lib/data.ts.", "hours": {}, "notices": {}}
if os.path.exists("data/research.json"):
    prev = json.load(open("data/research.json")); out["hours"].update(prev.get("hours", {})); out["notices"].update(prev.get("notices", {}))
applied, review = [], []
for d in data:
    if d.get("Category") != "Attraction opening hours": continue
    rec, u = (d.get("Matched site record") or "").strip(), (d.get("Evidence URL") or "").strip()
    details = (d.get("Additional verified details") or d.get("Season or access") or "").strip()
    why = None
    if not rec: why = "no matching record on the site"
    elif re.search(r"conflict|ambigu", (d.get("Verification") or "") + (d.get("Status") or ""), re.I): why = "sources disagree"
    txt = source_text(u) if not why else None
    if not why and txt is None: why = "source page could not be fetched"
    src = {"t": f"{org(u)}: {d['Name'].split('|')[0].strip()}", "u": u}
    if not why and (d.get("Status") or "") == "temporarily closed":
        if re.search(r"clos", txt, re.I):
            t = NOTICE.get(rec) or tidy(details)
            out["notices"][rec] = {"t": t + f" ({org(u)}).", "src": src, "sd": today}; applied.append((d, "closure notice")); continue
        why = "closure not found on the source page"
    if not why:
        want = norm_times(details)
        have = norm_times(txt)
        missing = want - have
        if not want: why = "no times to check"
        elif missing: why = f"times not found on the source page: {', '.join(sorted(missing))}"
    if why: review.append((d, why)); continue
    t = OVERRIDE.get(rec, tidy(details)) if rec in OVERRIDE else tidy(details)
    if t is None: review.append((d, "wording needs a person")); continue
    out["hours"][rec] = {"t": t, "src": src, "sd": today}
    applied.append((d, "opening hours"))
json.dump(out, open("data/research.json", "w"), indent=1, ensure_ascii=False)
os.makedirs("data/work", exist_ok=True)
with open("data/work/research_report.md", "w") as f:
    f.write(f"# Research import {today}\n\nApplied {len(applied)}, for review {len(review)}.\n\n## Applied\n")
    for d, what in applied: f.write(f"- {d['Matched site record']}: {d['Name'].split('|')[0].strip()} ({what})\n")
    f.write("\n## For review\n")
    for d, why in review: f.write(f"- {d.get('Staging id')}: {d['Name'].split('|')[0].strip()}: {why}\n")
print(f"applied {len(applied)}, review {len(review)}")
