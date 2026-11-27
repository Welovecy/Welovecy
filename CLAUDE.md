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
- `pois.json`: beaches, sights, towns. `attractions.json`: museums, family days out, venues, malls and marinas (built by `scripts/data/build_attractions.py` from the OSM extract made by `attractions.yml`, saved to `data/work/osm_attractions.json`); each has sources, an entrance pin where mapped, and `inside` = licensed venues within it (they get `at` and the attraction's pin). Kinds: sight, family, activity (dive centres, water sports), nature (walks and nature trails, with `len`, `grade` 1 to 3 from the Department of Forests scale, `place` = the place page it starts from), info (tourist information offices). `notice` on an attraction or a place (guide.json) shows a closure banner and Aphrodite says it first. New places by name: run `osm-lookup.yml` with a pattern, then add to SPEC. `knowledge.json`: Know before you go facts (sec, q keywords, t text, src), shown on `/know-before-you-go` and searched by Aphrodite's `know` tool (`src/lib/knowledge.ts`); recheck rules that change (entry, drones, e-scooters, roaming) monthly. Sections also hold areas (which area suits which trip), villages and history. Indoor categories for rainy days: `src/lib/indoor.ts` (`find_places` with `indoor:true`). `aliases.json`: other names by id, used by search and Aphrodite. `content.json`: destinations, places, experiences. `images.json`: photos and credits. `duty.json`: pharmacy rota (built by `scripts/content/duty.py`; 2026-27 winter rota, summer rota needed by April 2027). `bus.json`, `climate.json`, `distances.json`, `quiz.json`.
- Pins by phone: `scripts/data/match_phone.py <overture places json>` matches unpinned records to Overture places by registered phone (and pharmacists by name), only near their own town and never north of the line; results go into `data/work/overture_pins.json`, which `apply_pins.py` reads.
- Rebuild data: `npm run data`. Pins come from OpenStreetMap via GitHub Actions (`osm-refresh.yml`), because this workspace can't reach Overpass or Nominatim. `coast.yml` extracts coastline and roads for map graphics into the `coastline` branch.

## Key code
- `src/lib/geo.ts`: distances, walk/drive minutes, `taxiRange` (+25% margin), `howFar`.
- `src/lib/views.ts`: `aroundData` ("what's around"), `insideOf` (venues in a hotel).
- `src/lib/duty.ts`: duty pharmacies; `dirFor` searches Google Maps for "Φαρμακείο + street + town" (rota pins are approximate).
- `src/lib/going.ts`: eat and drink pages by area and cuisine. `src/lib/hotelsNear.ts`: hotels near beaches.
- `src/components/HomeHero.tsx`: homepage video, live strip, shortcuts. `HeroDemo.tsx`: the "Staying at…?" demo (keep its title at a fixed height).
- `src/components/Track.tsx`: tap tracking (Call, Map, Facebook, Outbound, Staying here, Email). `Consent.tsx`: cookie banner; Microsoft Clarity (project `zitl4a1c8f`) loads only after Accept.
- Aphrodite, the AI guide: `src/components/Ask.tsx` (orb button, homepage `AskBar`, glass sheet, cards; open from anywhere with `openAphrodite(q)`), `src/app/api/ask/route.ts` (Claude Haiku 5.5, persona and rules, cards, follow-ups, rate limit, `Ask` analytics event), `src/lib/ask/tools.ts` (tools over our data plus a sitemap search, so new data and pages are known on the next deploy). Needs `ANTHROPIC_API_KEY` in Vercel (Production and Preview); spend limit set in the Claude Console.
- Explore: `src/app/explore` (Places, `/events`, `/festivals`), `src/components/Explore.tsx`, feature card in `src/lib/explore.ts`. Events in `data/events.json` via `src/lib/events.ts`: every event needs a checked source_url (official or organiser first); unconfirmed dates go in as `dates_tbc` with `usual`. Add to calendar via `/api/ics/[id]`. Aphrodite reads events through the `events` tool.
- Partners (advertising): `data/partners.json` (public facts only, never fees or contracts), `src/lib/partners.ts` (`partnerFor` decides eligibility in code by where the visitor is staying), unlisted noindex pages at `/partners/[id]` (not in sitemap or search), `PartnerSlot` on matching airport guides, Aphrodite tool `transfer_partner` with a once-per-conversation check. Always labelled "Advertising partner". Events: Partner shown / book / call / page / website / email.
- `src/lib/site.ts`: emails (hello@ / business@), Facebook links.

## Pages
Home, explore (+ events, festivals), destinations, places, beaches, must-see, stay, hotels-near, eat-drink, around, listing/[id] (+ /around), guides, buses, weather, pharmacies-on-duty, practical, know-before-you-go, cyprus-history (from knowledge.json sec history), essentials, distances, unesco, wine, quiz, saved, search, about, list-your-business, privacy, credits.
