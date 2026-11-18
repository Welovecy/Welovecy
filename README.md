# welovecy.com

The We Love Cyprus guide to the Republic of Cyprus. Next.js (App Router), TypeScript, plain CSS. Installable as an app.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run check        # typecheck + tests + production build
```

Node 20.9 or newer.

## How it's organised

| Folder | What's in it |
| --- | --- |
| `data/` | The site's data. `content.json` is the hand-written copy (areas, places, stories). `businesses.json` and `pois.json` are built from the official registers. |
| `data/source/` | The original spreadsheets. |
| `data/work/` | Intermediate files for the data pipeline (map matches, geocoding results). |
| `scripts/data/` | Python pipeline that turns the spreadsheets into `data/*.json`. Run with `npm run data` (needs `pip install openpyxl`). |
| `src/lib/` | Data access, distances, search normalisation, device storage. |
| `src/components/` | Interface pieces. Files starting with `"use client"` run in the browser. |
| `src/app/` | Pages. Every URL is a folder. |
| `tests/` | Checks that run before every deploy, including the Republic of Cyprus scope check. |

### Rules the tests enforce

- Every mapped point sits inside the Republic of Cyprus. Nothing from the north.
- No em dashes in written copy.
- Every record belongs to a known area, every id is unique, every internal link in the copy resolves.
- Hotels east of Protaras are labelled Protaras, not Paralimni.
- "Nearest pharmacy" never points more than 15 km away. If nothing is mapped, the page says so.

### Updating data

1. Replace the spreadsheet in `data/source/` (keep the file name and column headings).
2. `npm run data`
3. `npm run check`
4. Commit and push. Vercel deploys automatically.

### Before launch

- Replace Wikimedia Commons stand-in photos with our own (see `/credits`).
- Replace the sample Lefkara maker and experience (marked "Sample", hidden from search engines).
- Add a contact address to `/list-your-business`.

---

## Going live: GitHub, Vercel, then the Squarespace domain

The domain stays registered at Squarespace. Only its DNS records change, so it points at the new site.

### 1. Put the code on GitHub

1. Create a private repository called `welovecy` at github.com/new.
2. In this folder:
   ```bash
   git init && git add . && git commit -m "First version"
   git branch -M main
   git remote add origin https://github.com/YOUR-ACCOUNT/welovecy.git
   git push -u origin main
   ```

### 2. Deploy on Vercel

1. Sign in at vercel.com with GitHub.
2. **Add New → Project**, pick `welovecy`, leave the settings as detected (Next.js), press **Deploy**.
3. In **Settings → Environment Variables** add `NEXT_PUBLIC_SITE_URL` = `https://welovecy.com`, then redeploy.
4. Check the preview address (something like `welovecy.vercel.app`) on your phone before touching the domain.

### 3. Add the domain in Vercel

1. Project → **Settings → Domains → Add**. Enter `welovecy.com`.
2. Vercel offers to add `www.welovecy.com` too and redirect one to the other. Accept, with `welovecy.com` as the main address.
3. Vercel now shows the exact records it wants. Usually:
   - `welovecy.com`: an **A** record, host `@`, pointing at the IP Vercel shows.
   - `www.welovecy.com`: a **CNAME** record, host `www`, pointing at the value Vercel shows (a project-specific address ending in `vercel-dns-0xx.com`).
   Copy the values from your dashboard, not from this page. Vercel changes them from time to time.

### 4. Change the records at Squarespace

1. Go to account.squarespace.com/domains and open `welovecy.com`.
2. Open **DNS** (sometimes labelled DNS settings). Squarespace may ask you to sign in again.
3. Remove the records that point the domain at Squarespace:
   - **A** records with host `@` that Squarespace added (often four of them).
   - The **CNAME** with host `www`.
   Use the trash icon on each. If they're grouped as "Squarespace Defaults", delete the group.
   Squarespace won't save a new record that clashes with an old one, so delete first.
4. Add the records from step 3: the **A** record for `@` and the **CNAME** for `www`, with the values Vercel gave you. Leave TTL at the default.
5. **Don't touch MX or TXT records** if the domain has email (for example Google Workspace). Deleting them stops email.

### 5. Wait and check

- Changes usually show within an hour, and can take up to 24 to 48 hours.
- Vercel's Domains page turns green when it sees the records, then issues the SSL certificate on its own. No action needed.
- Check `https://welovecy.com` and `https://www.welovecy.com`. Both should land on the new site with a padlock.

### If something goes wrong

- **"Invalid configuration" in Vercel after a day:** an old Squarespace A record is still there. Delete it.
- **Email stopped:** an MX record was removed. Re-add it from your email provider's setup page.
- **Want to roll back:** in Squarespace DNS, restore the Squarespace Defaults preset.

Sources: Vercel, "Adding & configuring a custom domain" (vercel.com/docs/domains/add-a-domain); Squarespace Help, DNS records for Squarespace domains (support.squarespace.com/hc/en-us/articles/360002101888). Reviewed 18 November 2026.
