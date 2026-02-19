import { scrapeAll } from './scrapers';
import { getCuratedListings } from './scrapers/curated';
import { fetchRealListings } from './scrapers/weeklymonthly';
import { fetchHomesListings } from './scrapers/homes-scraper';
import { fetch000AreaListings } from './scrapers/000area-scraper';
import { fetchWeeklyMonthlyNetListings } from './scrapers/weekly-monthly-net-scraper';
import { prisma } from '../app/lib/prisma';

// Re-export ListingSource type
export interface ListingSource {
  externalId: string;
  sourceUrl: string;
  type: 'monthly_mansion' | 'weekly_mansion' | 'apartment';
  price: number;
  deposit?: number | null;
  keyMoney?: number | null;
  nearestStation: string;
  walkTime: number;
  furnished: boolean;
  foreignerFriendly: boolean;
  photos: string[];
  descriptionEn: string;
  descriptionJp?: string;
  location: string;
  lat?: number;
  lng?: number;
  availableFrom?: Date;
}

/**
 * Ingest properties with duplicate prevention
 * Uses externalId or sourceUrl as unique identifiers
 */
export async function ingestProperties(listings: ListingSource[]) {
  const results = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [] as string[]
  };

  for (const listing of listings) {
    try {
      // Check for existing property by externalId or sourceUrl
      const existing = await prisma.property.findFirst({
        where: {
          OR: [
            { externalId: listing.externalId },
            { sourceUrl: listing.sourceUrl }
          ]
        }
      });

      if (existing) {
        // Check if data has changed
        const hasChanges = 
          existing.price !== listing.price ||
          existing.descriptionEn !== listing.descriptionEn ||
          existing.descriptionJp !== listing.descriptionJp ||
          existing.furnished !== listing.furnished ||
          existing.foreignerFriendly !== listing.foreignerFriendly;

        if (hasChanges) {
          // Update existing record
          await prisma.property.update({
            where: { id: existing.id },
            data: {
              price: listing.price,
              deposit: listing.deposit,
              keyMoney: listing.keyMoney,
              furnished: listing.furnished,
              foreignerFriendly: listing.foreignerFriendly,
              photos: listing.photos,
              descriptionEn: listing.descriptionEn,
              descriptionJp: listing.descriptionJp,
              lat: listing.lat,
              lng: listing.lng,
              availableFrom: listing.availableFrom
            }
          });
          results.updated++;
          console.log(`  Updated: ${listing.externalId} (${listing.location})`);
        } else {
          results.skipped++;
        }
      } else {
        // Create new property
        await prisma.property.create({
          data: {
            externalId: listing.externalId,
            sourceUrl: listing.sourceUrl,
            type: listing.type,
            price: listing.price,
            deposit: listing.deposit,
            keyMoney: listing.keyMoney,
            nearestStation: listing.nearestStation,
            walkTime: listing.walkTime,
            furnished: listing.furnished,
            foreignerFriendly: listing.foreignerFriendly,
            photos: listing.photos,
            descriptionEn: listing.descriptionEn,
            descriptionJp: listing.descriptionJp,
            location: listing.location,
            lat: listing.lat,
            lng: listing.lng,
            availableFrom: listing.availableFrom,
            pricingPlans: (listing as any).pricingPlans || [],
            tags: (listing as any).tags || []
          }
        });
        results.created++;
        console.log(`  Created: ${listing.externalId} (${listing.location})`);
      }
    } catch (error) {
      const errorMsg = `Failed to process ${listing.externalId}: ${error}`;
      results.errors.push(errorMsg);
      console.error(`  Error: ${errorMsg}`);
    }
  }

  return results;
}

/**
 * Remove stale listings that are no longer available
 */
export async function removeStaleListings(activeExternalIds: string[]) {
  const result = await prisma.property.deleteMany({
    where: {
      externalId: {
        notIn: activeExternalIds
      }
    }
  });
  
  console.log(`\n Removed ${result.count} stale listings`);
  return result.count;
}

/**
 * Main function: Scrape and ingest all properties
 * Uses multiple data sources for comprehensive coverage
 */
async function main() {
  console.log('=== Live Japan Data Ingestion ===\n');
  
  let scrapedListings: ListingSource[] = [];
  
  // Source 1: weeklyandmonthly.com
  console.log('Step 1: Fetching from weeklyandmonthly.com...\n');
  try {
    const listings = await fetchRealListings();
    scrapedListings.push(...listings);
    console.log(`✓ Fetched ${listings.length} listings from weeklyandmonthly.com\n`);
  } catch (error) {
    console.error('Failed to fetch from weeklyandmonthly.com:', error);
  }
  
  // Source 2: homes.jp
  console.log('Step 2: Fetching from homes.jp...\n');
  try {
    const listings = await fetchHomesListings();
    scrapedListings.push(...listings);
    console.log(`✓ Fetched ${listings.length} listings from homes.jp\n`);
  } catch (error) {
    console.log('homes.jp scraper not available or failed:', error);
  }
  
  // Source 3: 000area-weekly.com
  console.log('Step 3: Fetching from 000area-weekly.com...\n');
  try {
    const listings = await fetch000AreaListings();
    scrapedListings.push(...listings);
    console.log(`✓ Fetched ${listings.length} listings from 000area-weekly.com\n`);
  } catch (error) {
    console.log('000area-weekly.com scraper not available or failed:', error);
  }
  
  // Source 4: weekly-monthly.net
  console.log('Step 4: Fetching from weekly-monthly.net...\n');
  try {
    const listings = await fetchWeeklyMonthlyNetListings();
    scrapedListings.push(...listings);
    console.log(`✓ Fetched ${listings.length} listings from weekly-monthly.net\n`);
  } catch (error) {
    console.log('weekly-monthly.net scraper not available or failed:', error);
  }
  
  // Ingest into database
  console.log('\nStep 5: Ingesting into database...\n');
  const results = await ingestProperties(scrapedListings);
  
  // Summary
  console.log('\n=== Ingestion Summary ===');
  console.log(`Total properties scraped: ${scrapedListings.length}`);
  console.log(`Created: ${results.created}`);
  console.log(`Updated: ${results.updated}`);
  console.log(`Skipped: ${results.skipped}`);
  console.log(`Errors: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach(err => console.log(`  - ${err}`));
  }
  
  console.log('\n✓ Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
