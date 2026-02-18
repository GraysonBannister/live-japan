import { scrapeAll } from './scrapers';
import { getCuratedListings } from './scrapers/curated';
import { fetchRealListings } from './scrapers/weeklymonthly';
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
            availableFrom: listing.availableFrom
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
 */
async function main() {
  console.log('=== Live Japan Data Ingestion ===\n');
  
  // Step 1: Fetch real listings from weeklyandmonthly.com
  console.log('Step 1: Fetching real listings from weeklyandmonthly.com...\n');
  let scrapedListings: ListingSource[] = [];
  
  try {
    const realListings = await fetchRealListings();
    scrapedListings.push(...realListings);
    console.log(`✓ Fetched ${realListings.length} real listings\n`);
  } catch (error) {
    console.error('Failed to fetch real listings:', error);
  }
  
  // Step 2: Try other scrapers as backup
  if (scrapedListings.length < 5) {
    console.log('Trying alternative scrapers...\n');
    try {
      const altListings = await scrapeAll();
      scrapedListings.push(...altListings);
    } catch (error) {
      console.error('Alternative scraping failed:', error);
    }
  }
  
  // Step 3: If still few results, use curated data
  if (scrapedListings.length < 10) {
    console.log('\n⚠ Limited results from live scraping.');
    console.log('Using curated property database as fallback...\n');
    
    const curatedListings = getCuratedListings();
    
    // Filter out any curated listings that might conflict with scraped ones
    const scrapedUrls = new Set(scrapedListings.map(l => l.sourceUrl));
    const newCurated = curatedListings.filter(l => !scrapedUrls.has(l.sourceUrl));
    
    scrapedListings.push(...newCurated);
    console.log(`Added ${newCurated.length} curated listings\n`);
  }
  
  // Step 3: Ingest into database
  console.log('\nStep 2: Ingesting into database...\n');
  const results = await ingestProperties(scrapedListings);
  
  // Step 4: Summary
  console.log('\n=== Ingestion Summary ===');
  console.log(`Total properties: ${scrapedListings.length}`);
  console.log(`Created: ${results.created}`);
  console.log(`Updated: ${results.updated}`);
  console.log(`Skipped: ${results.skipped}`);
  console.log(`Errors: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach(err => console.log(`  - ${err}`));
  }
  
  // Optional: Remove stale listings
  // const activeIds = scrapedListings.map(l => l.externalId);
  // await removeStaleListings(activeIds);
  
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
