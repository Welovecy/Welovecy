"""Download partner photos listed in partner_images.txt and save them as WebP under public/img/partners/."""
import io, sys, urllib.request
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[2]
out = root / "public/img/partners"
for line in (root / "scripts/content/partner_images.txt").read_text().splitlines():
    if not line.strip() or line.startswith("#"):
        continue
    url, name = line.split()
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (welovecy.com partner page)"})
    im = Image.open(io.BytesIO(urllib.request.urlopen(req, timeout=60).read())).convert("RGB")
    im.thumbnail((1600, 1600))
    dest = out / f"{name}.webp"
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "WEBP", quality=80, method=6)
    print(dest.relative_to(root), im.size, dest.stat().st_size)
