"""Download the Cyprus slice of the Overture Maps places theme to data/work/overture_cyprus.json.

Reads only the row groups whose bounding box touches Cyprus, using HTTP range requests.
Set OVERTURE_RELEASE to pin a release, otherwise the newest one is used.
"""
import json, os, re, sys
import pyarrow as pa, pyarrow.parquet as pq, requests
sys.path.insert(0, os.path.dirname(__file__))
from rangefile import RangeFile

B = "https://overturemaps-us-west-2.s3.us-west-2.amazonaws.com"
BOX = (32.2, 34.5, 34.65, 35.3)

def main():
    rel = os.environ.get("OVERTURE_RELEASE") or sorted(re.findall(r"<Prefix>release/([^/<]+)/", requests.get(f"{B}/?list-type=2&prefix=release/&delimiter=/", timeout=30).text))[-1]
    prefix = f"release/{rel}/theme=places/type=place/"
    keys = re.findall(r"<Key>([^<]+)</Key>", requests.get(f"{B}/?list-type=2&prefix={prefix}", timeout=30).text)
    out = []
    for k in keys:
        f = pq.ParquetFile(pa.PythonFile(RangeFile(f"{B}/{k}"), mode="r"))
        md = f.metadata
        names = [md.schema.column(i).path for i in range(md.num_columns)]
        ix = {n: names.index(n) for n in ("bbox.xmin", "bbox.xmax", "bbox.ymin", "bbox.ymax")}
        for rg in range(md.num_row_groups):
            st = {n: md.row_group(rg).column(i).statistics for n, i in ix.items()}
            if st["bbox.xmin"].min > BOX[2] or st["bbox.xmax"].max < BOX[0] or st["bbox.ymin"].min > BOX[3] or st["bbox.ymax"].max < BOX[1]:
                continue
            cols = [c for c in ("id", "names", "basic_category", "taxonomy", "confidence", "addresses", "websites", "socials", "phones", "sources", "bbox") if c in f.schema_arrow.names]
            for r in f.read_row_group(rg, columns=cols).to_pylist():
                bb = r["bbox"]; x, y = (bb["xmin"] + bb["xmax"]) / 2, (bb["ymin"] + bb["ymax"]) / 2
                if not (BOX[0] <= x <= BOX[2] and BOX[1] <= y <= BOX[3]): continue
                a = (r.get("addresses") or [{}])[0] or {}
                tax = r.get("taxonomy")
                out.append({"id": r["id"], "n": (r.get("names") or {}).get("primary"), "cat": r.get("basic_category"),
                            "tax": tax.get("primary") if isinstance(tax, dict) else None, "conf": r.get("confidence"),
                            "ll": [round(y, 6), round(x, 6)], "addr": a.get("freeform"), "loc": a.get("locality"),
                            "src": sorted({s.get("dataset") for s in (r.get("sources") or []) if s})})
        print(k[-24:], len(out), file=sys.stderr)
    json.dump(out, open("data/work/overture_cyprus.json", "w", encoding="utf-8"), ensure_ascii=False)
    print(f"release {rel}: {len(out)} places")

if __name__ == "__main__":
    main()
