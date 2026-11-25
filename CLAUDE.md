# welovecy.com: working notes

The We Love Cyprus guide. Republic of Cyprus only, never the north. Owner: Dami Adufe, run by The One Experience Adufe Ltd.

## Rules for any change
- Copy: no em dashes, human tone, short headlines, price never the lead. Taxi fares are always a range ("€X–Y by taxi (estimate)"). Walking, driving and taxi figures are labelled as estimates.
- Every fact on a page has a source; official registers and tourism sources first. Never invent venues, figures or claims.
- Only show photos we're allowed to use (CC licences with credit, or the venue's permission). Credits live in `data/images.json`.
- Mobile first: most visitors are on phones (92%). Check 390px width and that nothing moves after load (layout shift).
- Before pushing: `npm run typecheck`, `npx vitest run`, `npm run build`. Push to `main` deploys to production on Vercel; branches get preview URLs.
- Commit as `We Love Cyprus <welovecy@users.noreply.github.com>`.

## Stack
Next.js 15 App Router, React 19, TypeScript, Vitest. Static pages (about 3,000) plus ISR for the homepage and duty pharmacy pages (revalidate 600). No database. Vercel Pro, Web Analytics (custom events), Speed Insights. Installable web app (`src/app/manifest.ts`, `public/sw.js`).

## Data (all in `data/`)
- `businesses.json`: every licensed business from the official registers, plus `extra_businesses.json` (our own additions, ids `wlc-0001`…; merged by `scripts/data/apply_pins.py`). Fields: `ll` pin, `ls` pin source (ov/osm/us), `pr` precision (approx/area; area pins are kept out of "what's around"), `vt` venue type, `cz` cuisines, `in`/`fl`/`hrs` for venues inside a hotel.
- `pois.json`: beaches, sights, towns. `content.json`: destinations, places, experiences. `images.json`: photos and credits. `duty.json`: pharmacy rota (built by `scripts/content/duty.py`; 2026-27 winter rota, summer rota needed by April 2027). `bus.json`, `climate.json`, `distances.json`, `quiz.json`.
- Rebuild data: `npm run data`. Pins come from OpenStreetMap via GitHub Actions (`osm-refresh.yml`), because this workspace can't reach Overpass or Nominatim. `coast.yml` extracts coastline and roads for map graphics into the `coastline` branch.

## Key code
- `src/lib/geo.ts`: distances, walk/drive minutes, `taxiRange` (+25% margin), `howFar`.
- `src/lib/views.ts`: `aroundData` ("what's around"), `insideOf` (venues in a hotel).
- `src/lib/duty.ts`: duty pharmacies; `dirFor` searches Google Maps for "Φαρμακείο + street + town" (rota pins are approximate).
- `src/lib/going.ts`: eat and drink pages by area and cuisine. `src/lib/hotelsNear.ts`: hotels near beaches.
- `src/components/HomeHero.tsx`: homepage video, live strip, shortcuts. `HeroDemo.tsx`: the "Staying at…?" demo (keep its title at a fixed height).
- `src/components/Track.tsx`: tap tracking (Call, Map, Facebook, Outbound, Staying here, Email). `Consent.tsx`: cookie banner; Microsoft Clarity (project `zitl4a1c8f`) loads only after Accept.
- Aphrodite, the AI guide: `src/components/Ask.tsx` (orb button, homepage `AskBar`, glass sheet, cards; open from anywhere with `openAphrodite(q)`), `src/app/api/ask/route.ts` (Claude Haiku 5.5, persona and rules, cards, follow-ups, rate limit, `Ask` analytics event), `src/lib/ask/tools.ts` (tools over our data plus a sitemap search, so new data and pages are known on the next deploy). Needs `ANTHROPIC_API_KEY` in Vercel (Production and Preview); spend limit set in the Claude Console.
- `src/lib/site.ts`: emails (hello@ / business@), Facebook links.

## Pages
Home, destinations, places, beaches, must-see, stay, hotels-near, eat-drink, around, listing/[id] (+ /around), guides, buses, weather, pharmacies-on-duty, practical, essentials, distances, unesco, wine, quiz, saved, search, about, list-your-business, privacy, credits.
