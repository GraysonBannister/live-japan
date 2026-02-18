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

## In Progress
- [ ] Phase 3: Deploy to Netlify with working build
- [ ] Phase 3: README with setup instructions

## Up Next
- [ ] Phase 3: Switch from SQLite to PostgreSQL for production
- [ ] Phase 3: Set up automated data ingestion cron job
- [ ] Phase 3: Add real property data sources (scrapers or APIs)

## Known Issues
- Static export (output: 'export') configured — all pages pre-rendered at build time
- Root page (/) redirects to /en via Netlify _redirects
- i18n message files (messages/en.json, messages/ja.json) may need more translation keys

## Data Ingestion System
**Usage:** `npm run ingest`
- Checks externalId and sourceUrl for duplicates
- Updates existing properties if data changed
- Skips unchanged properties
- Logs summary: created, updated, skipped, errors
- Supports removeStaleListings() to clean up old data

## Tech Stack
- Next.js 16.1.6, React 19, TypeScript 5
- Tailwind CSS 4, Prisma 7.4.0 (SQLite + better-sqlite3)
- next-intl 4.8.3, Leaflet + React-Leaflet
- Repo: https://github.com/GraysonBannister/live-japan