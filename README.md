# Live Japan

A Next.js 15 application for browsing property rentals in Japan. Features a responsive property grid, map view with Leaflet, advanced search filters, and internationalization support.

![Live Japan Screenshot](./screenshot.png)

## Features

- **Property Listings**: Browse 75+ property listings across Japan (Tokyo, Osaka, Kyoto, and more) with detailed information
- **Map View**: Interactive map with Leaflet showing property locations
- **Advanced Search**: Filter by price, beds, furnished, foreigner-friendly, and station proximity
- **Property Details**: Full property pages with image gallery and embedded map
- **i18n Support**: English and Japanese language support via next-intl
- **Pagination**: Efficient browsing with paginated results
- **Mobile Responsive**: Optimized for all device sizes
- **Data Ingestion**: Automated system for importing and updating property data with duplicate prevention

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: SQLite with Prisma 7.4.0 (better-sqlite3 adapter)
- **ORM**: Prisma 7
- **Maps**: Leaflet + React-Leaflet
- **i18n**: next-intl 4.8.3
- **Deployment**: Netlify

## Prerequisites

- Node.js 22 or later
- npm or pnpm

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/GraysonBannister/live-japan.git
cd live-japan
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

The default configuration uses SQLite and requires no additional setup for local development.

### 4. Set Up the Database

Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Seed the Database

Populate the database with sample property listings:

```bash
npm run seed
```

This creates 75 Tokyo property listings in `prisma/dev.db`.

### 6. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The application will redirect to `/en` by default.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build production static export |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed database with sample properties |
| `npm run ingest` | Run data ingestion script |
| `npx prisma studio` | Open Prisma Studio for database management |
| `npx prisma migrate dev` | Run database migrations |
| `npx prisma generate` | Generate Prisma client |

## Project Structure

```
live-japan/
├── app/                    # Next.js App Router
│   ├── [locale]/           # i18n locale routing
│   │   ├── page.tsx        # Landing page with property grid
│   │   ├── layout.tsx      # Root layout with providers
│   │   └── map/page.tsx    # Map view page
│   ├── property/[id]/      # Property detail pages
│   ├── api/                # API routes
│   ├── components/         # React components
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyGrid.tsx
│   │   ├── PropertyMap.tsx
│   │   ├── SearchForm.tsx
│   │   └── ViewToggle.tsx
│   └── globals.css         # Global styles
├── components/ui/          # shadcn/ui components
├── lib/                    # Utility functions
│   ├── prisma.ts           # Prisma client singleton
│   └── utils.ts
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts             # Seed script
│   └── dev.db              # SQLite database (gitignored)
├── messages/               # i18n translation files
│   ├── en.json
│   └── ja.json
├── scripts/
│   └── ingest.ts           # Data ingestion system
├── public/                 # Static assets
├── next.config.ts          # Next.js configuration
├── netlify.toml            # Netlify deployment config
└── _redirects              # Netlify redirects
```

## Database Schema

### Property Model

```prisma
model Property {
  id              String   @id @default(cuid())
  externalId      String?  @unique
  sourceUrl       String?  @unique
  title           String
  description     String?
  price           Int
  beds            Int
  baths           Float
  sqm             Float
  address         String
  latitude        Float
  longitude       Float
  images          String
  availableDate   DateTime?
  furnished       Boolean  @default(false)
  foreignerFriendly Boolean @default(false)
  nearestStation  String?
  stationDistance Int?     // minutes walking
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## Data Ingestion

The ingestion system supports importing property data from multiple external sources with duplicate prevention.

### Data Sources

The system now aggregates listings from multiple sites:
1. **weeklyandmonthly.com** - Main source (30 regions across Japan)
2. **homes.jp** - Additional Tokyo listings
3. **000area-weekly.com** - Expanded coverage
4. **weekly-monthly.net** - Additional listings

### Prerequisites for Data Ingestion

The scrapers use **ScraperAPI** to bypass bot detection.

1. Sign up for a free account at [scraperapi.com](https://www.scraperapi.com/)
2. Get your API key from the dashboard
3. Add to your `.env` file:
   ```bash
   SCRAPER_API_KEY=your_api_key_here
   ```

**Free tier**: 5,000 API calls/month (sufficient for ~50 full ingestion runs)

### Alternative Scraping Options

If ScraperAPI doesn't work, we've implemented alternative approaches:

**Option B - API Detection** (`scripts/scrapers/api-detector.ts`):
- Automatically checks for hidden JSON APIs
- Tests common endpoint patterns (/api/rooms, /ajax/search, etc.)
- Result: None of the target sites expose public APIs

**Option C - Playwright + Advanced Stealth** (`scripts/scrapers/playwright-scraper.ts`):
- Uses Playwright browser with enhanced stealth
- Overrides navigator.webdriver, permissions, plugins
- Sets realistic timezone/locale/fingerprint
- Available as fallback if Puppeteer fails

**Option D - Multiple Data Sources** (Current approach):
- Aggregates from 4 different monthly mansion sites
- Reduces dependency on single source
- Increases total listing coverage

### Usage

```bash
npm run ingest
```

This will sequentially scrape all configured sources and ingest into the database.

### Features

- **Duplicate Prevention**: Uses `externalId` and `sourceUrl` unique constraints
- **Update Detection**: Compares existing data and updates if changed
- **Skip Unchanged**: Efficiently skips properties that haven't changed
- **Stale Cleanup**: Supports `removeStaleListings()` to remove old data

### Adding a New Data Source

1. Create a fetcher function in `scripts/ingest.ts`
2. Transform data to match the Property schema
3. Call `ingestProperties()` with your data array

## Deployment

### Netlify

The project is configured for static export and deployment to Netlify.

**Configuration files:**
- `netlify.toml` - Build settings and headers
- `_redirects` - URL redirects (root → /en)
- `next.config.ts` - `output: 'export'` for static generation

**Build command:**
```bash
npm run build
```

**Deploy manually:**
```bash
netlify deploy --prod --dir=dist
```

### Environment Variables for Production

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | For Postgres |
| `NEXT_PUBLIC_SITE_URL` | Public site URL | Recommended |

## Switching to PostgreSQL (Production)

For production deployments, switch from SQLite to PostgreSQL:

1. Update `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Set `DATABASE_URL` in your environment:

```bash
DATABASE_URL="postgresql://user:password@host:5432/livejapan"
```

3. Run migrations:

```bash
npx prisma migrate deploy
```

## Internationalization

The app uses `next-intl` for i18n support.

- **Supported locales**: `en`, `ja`
- **Default locale**: `en`
- **Messages**: Located in `messages/en.json` and `messages/ja.json`

To add a new translation key:

1. Add to `messages/en.json`
2. Add corresponding translation to `messages/ja.json`
3. Use in components: `const t = useTranslations(); t('key.subkey')`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'feat: add new feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit a pull request

Follow conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`

## License

MIT License - see LICENSE file for details

## Links

- **Repository**: https://github.com/GraysonBannister/live-japan
- **Issues**: https://github.com/GraysonBannister/live-japan/issues
- **Live Demo**: https://live-japan.netlify.app

---

Built with ❤️ for finding your perfect home in Japan.
# Build timestamp: Thu Feb 19 12:19:14 JST 2026
