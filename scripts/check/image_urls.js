// Check every photo URL in data/images.json loads: node scripts/check/image_urls.js out.txt
const fs = require("fs");
const im = JSON.parse(fs.readFileSync("data/images.json", "utf8"));
(async () => {
  const out = [];
  for (const [k, v] of Object.entries(im)) {
    if (!/^https?:/.test(v.u)) continue;
    let s = "ERR";
    try { const r = await fetch(v.u, { headers: { "User-Agent": "welovecy.com image check" } }); s = r.status + " " + (r.headers.get("content-type") || ""); } catch (e) { s = "ERR " + e.message; }
    out.push(`${s.startsWith("200") ? "OK  " : "FAIL"} ${k} ${s} ${v.u}`);
    await new Promise((r) => setTimeout(r, 150));
  }
  fs.writeFileSync(process.argv[2], out.join("\n") + "\n");
  console.log(out.filter((l) => l.startsWith("FAIL")).join("\n") || "all images load");
})();
