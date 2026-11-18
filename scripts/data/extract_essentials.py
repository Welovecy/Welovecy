"""Read the beaches/supermarkets/healthcare workbook into data/work/ess_raw.json."""
import openpyxl, json
wb = openpyxl.load_workbook('data/source/beaches-supermarkets-healthcare.xlsx', read_only=True, data_only=True)
def load(name):
    rows = list(wb[name].iter_rows(values_only=True)); h = rows[4]
    return [dict(zip(h, r)) for r in rows[5:] if any(r)]
D = {n: load(n) for n in ['Beaches', 'Supermarkets', 'Pharmacies', 'Healthcare', 'Bathing points']}
json.dump({n: [{k: (v.isoformat() if hasattr(v, 'isoformat') else v) for k, v in r.items() if k} for r in rows] for n, rows in D.items()},
          open('data/work/ess_raw.json', 'w'), ensure_ascii=False)
print({n: len(r) for n, r in D.items()})
