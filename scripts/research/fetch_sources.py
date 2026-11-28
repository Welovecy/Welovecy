"""Fetch every source page in urls.txt and keep its plain text, so facts can be checked against the page itself."""
import hashlib, json, os, re, subprocess, urllib.request
UA = {"User-Agent": "Mozilla/5.0 (welovecy.com source check; welovecy@users.noreply.github.com)"}
os.makedirs("research_check/text", exist_ok=True)
out = {}
for u in [l.strip() for l in open("scripts/research/urls.txt") if l.strip()]:
    k = hashlib.sha1(u.encode()).hexdigest()[:12]
    r = {"url": u, "file": f"text/{k}.txt"}
    try:
        resp = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60)
        b = resp.read(); r["status"] = resp.status; r["type"] = resp.headers.get("content-type", "")
        if b[:4] == b"%PDF" or "pdf" in r["type"]:
            open("/tmp/x.pdf", "wb").write(b); t = subprocess.run(["pdftotext", "-layout", "/tmp/x.pdf", "-"], capture_output=True, text=True).stdout
        else:
            h = b.decode("utf-8", "ignore")
            h = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", h)
            t = re.sub(r"[ \t]+", " ", re.sub(r"<[^>]+>", " ", h))
            t = re.sub(r"\n\s*\n+", "\n", t)
        import html as H; t = H.unescape(t)
        open(f"research_check/{r['file']}", "w").write(t[:400000]); r["chars"] = len(t)
    except Exception as e:
        r["error"] = repr(e)[:200]
    out[u] = r
json.dump(out, open("research_check/index.json", "w"), indent=1)
print(sum(1 for v in out.values() if "error" not in v), "of", len(out), "fetched")
