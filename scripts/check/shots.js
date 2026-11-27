// Phone screenshots of a page for design review: node scripts/check/shots.js <base url> <out dir>
const { chromium, devices } = require("playwright");
const fs = require("fs");
const [base, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch();
  const ctx = async (geo) => {
    const c = await b.newContext({ ...devices["iPhone 13"], ...(geo ? { geolocation: geo, permissions: ["geolocation"] } : {}) });
    await c.addInitScript(() => { try { localStorage.setItem("wlc-consent", "declined"); } catch {} });
    return c;
  };
  const shoot = async (p, name) => { await p.waitForTimeout(900); await p.screenshot({ path: `${out}/${name}.png` }); };
  const open = async (c) => {
    const p = await c.newPage();
    await p.goto(`${base}/beaches`, { waitUntil: "networkidle" });
    const d = p.locator("text=Decline"); if (await d.count()) await d.first().click();
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
    return p;
  };
  // A list of pages to shoot instead of the Beaches walkthrough
  if (fs.existsSync("scripts/check/shot_pages.txt")) {
    const c0 = await ctx(null); let n = 1;
    for (const path of fs.readFileSync("scripts/check/shot_pages.txt", "utf8").split("\n").map((x) => x.trim()).filter(Boolean)) {
      const p0 = await c0.newPage();
      await p0.goto(`${base}${path}`, { waitUntil: "networkidle" });
      const d0 = p0.locator("text=Decline"); if (await d0.count()) await d0.first().click();
      await p0.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); } window.scrollTo(0, 0); });
      await p0.waitForTimeout(1200);
      await p0.screenshot({ path: `${out}/${String(n++).padStart(2, "0")}${path.replace(/[^a-z0-9]+/gi, "_")}.png`, fullPage: true });
      await p0.close();
    }
    await b.close();
    return;
  }
  let c = await ctx(null); let p = await open(c);
  await shoot(p, "01-top");
  await p.evaluate(() => window.scrollTo(0, 560)); await shoot(p, "02-filters");
  await p.evaluate(() => window.scrollTo(0, 1150)); await shoot(p, "03-favourites");
  await p.evaluate(() => window.scrollTo(0, 1800)); await shoot(p, "04-list");
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.locator(".bx-scroll .chip", { hasText: "Paphos" }).first().click();
  await p.locator(".bx-moods .chip", { hasText: "Sandy" }).click();
  await p.evaluate(() => window.scrollTo(0, 260)); await shoot(p, "05-paphos-sandy");
  await c.close();
  c = await ctx({ latitude: 34.9845, longitude: 33.9585 }); p = await open(c);
  await p.locator(".bx-near").click(); await p.waitForTimeout(1200);
  await p.evaluate(() => window.scrollTo(0, 260)); await shoot(p, "06-near-me");
  await p.evaluate(() => window.scrollTo(0, 1000)); await shoot(p, "07-near-me-cards");
  await p.evaluate(() => window.scrollTo(0, 1650)); await shoot(p, "08-near-me-list");
  await p.locator(".bx-ask-q").first().click(); await p.waitForTimeout(400); await shoot(p, "09-aphrodite");
  await b.close();
})();
