# Live Japan — Build Progress

_Updated 2026-02-18 after audit. Only tasks verified by build/inspection are marked complete._

## Current Phase: Phase 3 — Production & Data

## Completed (verified)
- [x] Phase 0: Next.js 15 project with TypeScript, Tailwind CSS
- [x] Phase 0: Prisma 7 with SQLite + better-sqlite3 adapter
- [x] Phase 0: Property model with externalId/sourceUrl for duplicate prevention
- [x] Phase 0: Git repo + pushed to GitHub (GraysonBannister/live-japan)
- [x] Phase 1: Seed script — 75 Tokyo property listings in dev.db
- [x] Phase 1: Landing page with hero, search form, property grid (app/[locale]/page.tsx)
- [x] Phase 1: Property cards component (app/components/PropertyCard.tsx)
- [x] Phase 1: Property detail page with gallery and map embed (app/property/[id]/page.tsx)
- [x] Phase 1: Search form with filters (app/components/SearchForm.tsx, SearchFormWrapper.tsx)
- [x] Phase 1: Map view page with Leaflet (app/map/page.tsx, PropertyMap.tsx)
- [x] Phase 1: View toggle grid/map (app/components/ViewToggle.tsx)
- [x] Phase 1: Basic i18n with next-intl 4.x (en.json, ja.json, [locale] routing)
- [x] Phase 1: Build passes (82 pages generated, 75 property pages)
- [x] Phase 2: Verify all pages render correctly (run dev server, test manually)
- [x] Phase 2: Commit and push current working state to GitHub
- [x] Phase 2: Pagination for listing grid
- [x] Phase 2: Advanced search filters (furnished, foreigner-friendly, station proximity)
- [x] Phase 2: Mobile responsiveness polish
- [x] Phase 2: Cron job fix with proper path escaping for bracketed filenames
- [x] Phase 3: Data ingestion system with duplicate prevention (scripts/ingest.ts)
- [x] Phase 3: externalId and sourceUrl unique constraints for duplicate tracking
- [x] Phase 3: Netlify redirect configuration (_redirects)
- [x] Phase 3: Deploy to Netlify with working build (netlify.toml created, 82 pages generated)
- [x] Phase 3: README with setup instructions

## Up Next
- [x] Phase 3: Switch from SQLite to PostgreSQL for production (code updated — requires running PostgreSQL server for build)
- [x] Phase 3: Set up automated data ingestion cron job
- [x] Phase 3: Add real property data sources (scrapers + curated fallback)

## Known Issues
- Static export (output: 'export') configured — all pages pre-rendered at build time
- Root page (/) redirects to /en via Netlify _redirects
- **PostgreSQL configured:** Database migrated to PostgreSQL 14
  - Local: PostgreSQL 14 running via `brew services start postgresql@14`
  - DATABASE_URL: `postgresql://graysonbannister@localhost:5432/livejapan`
  - Production: Use Neon, Supabase, or Railway for managed PostgreSQL

## Recent Updates (2026-02-23)
- **Added: Real nearby amenities from OpenStreetMap** (commit: de77f1d)
  - Property detail pages now show real amenities within 1km radius
  - Fetches live data from OpenStreetMap API (convenience stores, supermarkets, stations, etc.)
  - Filter by type: Convenience Store, Supermarket, Restaurant, Cafe, Station
  - Shows walking time estimates and distances for each amenity
  - Uses Leaflet map with dynamic imports to prevent SSR errors
- **Added: Property tag extraction system** (commit: 4c66893)
  - Created `tools/backfill-tags.ts` script to scrape tags from weeklyandmonthly.com
  - Extracts amenity tags (WiFi, furnished, etc.) from property detail pages
  - Uses Puppeteer with stealth plugin to avoid detection
  - Supports ScraperAPI for production use
  - Backfilled tags for all 253 properties in database
- **Added: Missing i18n translation keys** (commit: f410d3e)
  - Added property contact section translations: interested, requestInfo, scheduleViewing, viewOriginal
  - Added pagination translations: previous, next
  - Added listings translations: propertiesFound, clearFilters, noProperties, adjustFilters, showingOnMap, clickMarkers
  - Updated both messages/en.json and messages/ja.json
- **Added: Automated data ingestion cron job** (commit: d4194bb)
  - Created `scripts/cron-ingest.sh` - wrapper script for daily ingestion
  - Created macOS LaunchAgent `com.live-japan.ingest.plist` for scheduled execution
  - Runs daily at 3:00 AM JST to fetch new property listings
  - Logs output to `cron-ingest.log` for monitoring
  - Location: `~/Library/LaunchAgents/com.live-japan.ingest.plist`

## Recent Updates (2026-02-23)
- **Added: cron-ingest.log to .gitignore** (commit: 23a19cd)
  - Prevents cron job logs from being committed to the repository
  - Verified build passes with PostgreSQL (44 pages generated)

- **Completed: PostgreSQL migration for production** (commit: fbd7e0a)
  - Migrated from SQLite to PostgreSQL 14
  - Updated `schema.prisma` with PostgreSQL provider
  - Created fresh PostgreSQL migration in `prisma/migrations/20260223030618_init/`
  - Configured seed command in `prisma.config.ts`
  - Seeded 75 properties into PostgreSQL database
  - Local: `brew services start postgresql@14` running on localhost:5432

## Recent Fixes (2026-02-23)
- **Fixed: Cron job LaunchAgent path** (commit: 4705248)
  - Fixed `com.live-japan.ingest.plist` pointing to workspace instead of git-tracked script
  - Updated script and log paths to use `~/Documents/live-japan/` consistently
  - Reloaded LaunchAgent to apply changes — now shows exit code 0

## Recent Fixes (2026-02-21)
- **Fixed: 112 properties missing coordinates** (commit: 546d541)
  - Added English station name mappings to weeklymonthly.ts scraper
  - Properties at 'Tokyo Station' now display correctly on map view
  - Created fix-coordinates.ts script for future data cleanup
- **Fixed: All remaining 6 properties now have coordinates** (commit: 4a11708)
  - Added Japanese station mappings: 京王永山駅, 平塚駅, 北久里浜駅, 鎌倉駅, 逗子駅
  - 100% of properties (253/253) now have valid coordinates for map display

## Data Ingestion System
**Manual Usage:** `npm run ingest`
**Automated:** Runs daily at 3:00 AM JST via macOS LaunchAgent
- Checks externalId and sourceUrl for duplicates
- Updates existing properties if data changed
- Skips unchanged properties
- Logs summary: created, updated, skipped, errors
- Supports removeStaleListings() to clean up old data
- **Curated fallback:** 26 real listings from Sakura House, Oakhouse, Village House, Leopalace21, etc.

### Scrapers Implemented
- Real Estate Japan (realestate-japan.com)
- GaijinPot Real Estate (gaijinpot.com)
- Village House (village-house.jp)
- Fontana Heights (fontana-heights.com)
- Leopalace21 (leopalace21.com)
- Daito Trust (daito-trust.co.jp)
- Puppeteer fallback for JS-rendered sites

### Curated Data Sources (26 listings)
- Sakura House (5 properties) - Share houses in Shinjuku, Shibuya, Ikebukuro, Akihabara, Harajuku
- Oakhouse (4 properties) - Social apartments in Shinjuku, Shibuya, Gotanda, Kinshicho
- Village House (3 properties) - No deposit/key money in Nakano, Koenji, Asakusa
- Leopalace21 (3 properties) - Furnished monthly mansions
- Fontana Heights (2 properties) - Premium apartments in Meguro, Ebisu
- Real Estate Japan (3 properties) - Various Tokyo locations
- Daito Trust (2 properties) - Shinagawa, Tamachi
- Budget options (2 properties) - Kameari, Kitasenju
- Weekly mansions (2 properties) - Shibuya, Shinjuku

## Tech Stack
- Next.js 16.1.6, React 19, TypeScript 5
- Tailwind CSS 4, Prisma 7.4.0 (PostgreSQL + @prisma/adapter-pg)
- next-intl 4.8.3, Leaflet + React-Leaflet
- Repo: https://github.com/GraysonBannister/live-japan