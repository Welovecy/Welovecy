"""
Overture Maps places for Cyprus (CDLA Permissive 2.0), newest release. Runs on GitHub Actions (overture.yml),
because our build machines can't reach the Overture bucket. Output: overture_places.json on the `overture` branch,
in the shape match_overture.py and match_phone.py read: id, n, ll, cat, tax, conf, addr, ph.
"""
import json, sys, urllib.request
import duckdb

def latest_release():
    cat = json.load(urllib.request.urlopen("https://stac.overturemaps.org/catalog.json", timeout=60))
    rels = sorted(l["href"].strip("./").split("/")[0] for l in cat["links"] if l.get("rel") == "child")
    return rels[-1]

def main(out):
    rel = latest_release()
    print("release", rel)
    con = duckdb.connect()
    for s in ("INSTALL httpfs", "LOAD httpfs", "SET s3_region='us-west-2'"): con.execute(s)
    q = f"""
      SELECT id, names.primary AS n, ST_Y(geometry) AS lat, ST_X(geometry) AS lon,
             categories.primary AS cat, array_to_string(categories.alternate, ' ') AS tax, confidence AS conf,
             addresses[1].freeform AS addr, phones[1] AS ph
      FROM read_parquet('s3://overturemaps-us-west-2/release/{rel}/theme=places/type=place/*', hive_partitioning=1)
      WHERE bbox.xmin BETWEEN 32.2 AND 34.7 AND bbox.ymin BETWEEN 34.5 AND 35.3
    """
    con.execute("INSTALL spatial"); con.execute("LOAD spatial")
    rows = con.execute(q).fetchall()
    items = [{"id": r[0], "n": r[1] or "", "ll": [round(r[2], 6), round(r[3], 6)], "cat": r[4] or "", "tax": r[5] or "", "conf": r[6] or 0,
              "addr": r[7] or "", "ph": r[8] or ""} for r in rows if r[1]]
    json.dump(items, open(out, "w"), ensure_ascii=False)
    print(len(items), "places")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "overture_places.json")
