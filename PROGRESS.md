# Live Japan — Build Progress

_Updated 2026-02-18 after audit. Only tasks verified by build/inspection are marked complete._

## Current Phase: Phase 2 — Enhancements

## Completed (verified)
- [x] Phase 0: Next.js 15 project with TypeScript, Tailwind CSS
- [x] Phase 0: Prisma 7 with SQLite + better-sqlite3 adapter
- [x] Phase 0: Property + Photo models, migrations applied
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

## In Progress
- [x] Phase 2: Verify all pages render correctly (run dev server, test manually)
- [x] Phase 2: Commit and push current working state to GitHub

## Up Next
- [ ] Phase 2: Pagination for listing grid
- [ ] Phase 2: Advanced search filters (furnished, foreigner-friendly, station proximity)
- [ ] Phase 2: Mobile responsiveness polish
- [ ] Phase 3: Deploy to Vercel
- [ ] Phase 3: Switch from SQLite to PostgreSQL for production
- [ ] Phase 3: README with setup instructions

## Known Issues
- Static export (output: 'export') removed — next-intl uses headers() which is incompatible
- App uses SSR mode — needs Node.js runtime on Vercel (not static hosting)
- i18n message files (messages/en.json, messages/ja.json) may need more translation keys
- Root page (/) redirects to /en — no locale detection yet

## Tech Stack
- Next.js 16.1.6, React 19, TypeScript 5
- Tailwind CSS 4, Prisma 7.4.0 (SQLite + better-sqlite3)
- next-intl 4.8.3, Leaflet + React-Leaflet
- Repo: https://github.com/GraysonBannister/live-japan
