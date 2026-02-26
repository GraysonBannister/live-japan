# Live Japan — Build Progress

_Updated 2026-02-27. Commit: 264508c_

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

## Recent Updates (2026-02-27)
- **Fixed: Cron job LaunchAgent exit code 127 error** (commit: 264508c)
  - Unloaded and reloaded `com.live-japan.ingest` LaunchAgent to fix cached/stale state
  - `launchctl list` now shows exit code 0 (was 127 - command not found)
  - Cron job scheduled to run daily at 3:00 AM JST is now operational
  - Memory file added documenting the fix

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

## Recent Updates (2026-02-24)
- **Added: Multi-currency support with real-time exchange rates** (commit: d7fb1e2)
  - 8 supported currencies: JPY, USD, EUR, GBP, AUD, CAD, CNY, KRW
  - Real-time rates from open.er-api.com with 5-minute cache
  - Auto-detects user currency from browser locale
  - Currency selector in header with flag icons
  - All prices display in user's selected currency
  - Persists currency preference to localStorage
- **Fixed: Hydration mismatch for currency conversion** (commit: 53b568a)
  - Added mounted state to prevent React hydration mismatches
  - Prices correctly switch to user's currency after client hydration
- **Added: Supabase integration with authentication** (commit: 6607bc5)
  - Integrated Supabase for managed PostgreSQL database
  - Added authentication system with sign up/sign in
  - Created auth callback handler for OAuth flows
  - Middleware for session management and route protection
- **Added: Admin dashboard** (commit: 6be566d)
  - Admin listing management page at `/admin/listings`
  - Admin freshness monitoring at `/admin/freshness`
  - Manual ingestion trigger at `/admin/run-ingest`
  - Data verification tools at `/admin/verify`
  - Translation management at `/admin/translate`
  - Edit property functionality at `/admin/listings/[id]/edit`
- **Added: Header navigation and relocation page** (commit: 6965d14)
  - New Header component with navigation links
  - Sign up button linking to auth page
  - Relocation service page at `/relocation`
  - Professional relocation assistance information for foreigners

## Recent Updates (2026-02-27)
- **Fixed: Prisma client for PostgreSQL + ingest dotenv** (commit: a0000c1)
  - Updated `app/lib/prisma.ts` to use `@prisma/adapter-pg` instead of SQLite adapter
  - Added `import 'dotenv/config'` to `scripts/ingest.ts` so SCRAPER_API_KEY loads properly
  - Verified: Build passes (49 pages), Prisma client connects to PostgreSQL (75 properties)

## Recent Updates (2026-02-26)
- **Fixed: Prisma schema provider mismatch** (commit: 2234c6c)
  - Changed `provider = "sqlite"` to `provider = "postgresql"` in schema.prisma
  - Recreated migrations for PostgreSQL compatibility (was causing migration failures)
  - Added missing List and ListItem tables via new migration
  - All 75 properties preserved, build passes (49 pages)

- **Added: User lists feature** (commit: ec75fba)
  - Save properties to personal lists from property detail page
  - `/lists` page to view and manage saved properties
  - Create, rename, delete lists
  - Remove properties from lists
  - Integrated with ListsProvider context

- **Added: Settings page** (commit: e12965c)
  - `/settings` page for user preferences
  - Currency persistence fix - properly saves and restores user selection
  - Location filter improvements

- **Added: User menu in header** (commit: e12965c)
  - Dropdown menu with user avatar/initials
  - Links to lists, settings, and sign out
  - Shows auth state (sign in/up vs user menu)

- **Added: Room count and size filters** (commit: 596ff58)
  - Filter by number of rooms (1R, 1K, 1DK, 1LDK, 2LDK, 3LDK+)
  - Filter by property size in sqm or sqft
  - Unit toggle between metric and imperial

- **Improved: Search form layout** (commits: ca19a1f, 943b244)
  - Reorganized into 3 rows for better spacing
  - Removed checkbox filters (now handled by dropdowns)
  - Cleaner, more compact design

- **Added: Currency-aware price filters** (commit: 2ce58fa)
  - Price range filters work with selected currency
  - Proper conversion between JPY and display currency

## Recent Updates (2026-02-25)
- **Fixed: LaunchAgent exit code 127 error** (commit: 485cbdd)
  - Changed ProgramArguments from direct script path to explicit `/bin/zsh` invocation
  - Fixed: `/bin/zsh: can't open input file` error in cron logs
  - LaunchAgent now shows exit code 0 (verified via `launchctl list`)
  - Added plist template to `scripts/com.live-japan.ingest.plist` for tracking
  - Unload/reload required to apply: `launchctl unload/load ~/Library/LaunchAgents/com.live-japan.ingest.plist`

- **Added: Memory directory and session notes** (commit: 37347e9)
  - Created `memory/` directory for daily session documentation per AGENTS.md workflow
  - Added 2026-02-25.md with current state verification and build status
  - Documents 75 properties, successful build (47 pages), and cron job status

## Recent Fixes (2026-02-24)
- **Fixed: Cron script PATH for launchctl** (commit: b7e4cb4)
  - Added PATH export to include Homebrew and npm locations
  - LaunchAgent now shows exit code 0 (was 127 - command not found)
  - Added PATH logging for debugging cron job execution

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