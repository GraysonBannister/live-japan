import { scrapeAll } from './scrapers';
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
  
  // Step 1: Scrape all sources
  console.log('Step 1: Scraping property sites...\n');
  const scrapedListings = await scrapeAll();
  
  if (scrapedListings.length === 0) {
    console.log('\n⚠ No properties found from scraping.');
    console.log('This could mean:');
    console.log('  - Sites have changed their HTML structure');
    console.log('  - Sites require JavaScript (need headless browser)');
    console.log('  - Rate limiting or blocking');
    console.log('\nUsing sample data instead...\n');
    
    // Fallback to sample data for testing
    scrapedListings.push(...getSampleListings());
  }
  
  // Step 2: Ingest into database
  console.log('\nStep 2: Ingesting into database...\n');
  const results = await ingestProperties(scrapedListings);
  
  // Step 3: Summary
  console.log('\n=== Ingestion Summary ===');
  console.log(`Total scraped: ${scrapedListings.length}`);
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

/**
 * Sample listings for testing
 */
function getSampleListings(): ListingSource[] {
  return [
    {
      externalId: 'sakura-shibuya-001',
      sourceUrl: 'https://www.sakura-house.com/property/shibuya-001',
      type: 'monthly_mansion',
      price: 85000,
      deposit: null,
      keyMoney: null,
      nearestStation: 'Shibuya Station',
      walkTime: 8,
      furnished: true,
      foreignerFriendly: true,
      photos: ['https://example.com/photo1.jpg'],
      descriptionEn: 'Cozy furnished apartment in Shibuya, perfect for short-term stays. WiFi included.',
      descriptionJp: '渋谷の家具付きアパート。短期滞在に最適。WiFi付き。',
      location: 'Shibuya',
    },
    {
      externalId: 'oakhouse-shinjuku-042',
      sourceUrl: 'https://www.oakhouse.jp/property/shinjuku-042',
      type: 'monthly_mansion',
      price: 72000,
      deposit: null,
      keyMoney: null,
      nearestStation: 'Shinjuku Station',
      walkTime: 12,
      furnished: true,
      foreignerFriendly: true,
      photos: ['https://example.com/photo2.jpg'],
      descriptionEn: 'Social apartment with shared lounge and kitchen. Great for meeting people.',
      descriptionJp: '共有ラウンジとキッチンのあるソーシャルアパート。人との出会いに最適。',
      location: 'Shinjuku',
    },
    {
      externalId: 'gaijinpot-akihabara-103',
      sourceUrl: 'https://housing.gaijinpot.com/property/akihabara-103',
      type: 'apartment',
      price: 95000,
      deposit: 95000,
      keyMoney: 95000,
      nearestStation: 'Akihabara Station',
      walkTime: 5,
      furnished: false,
      foreignerFriendly: true,
      photos: ['https://example.com/photo3.jpg'],
      descriptionEn: '1LDK apartment near Akihabara. Foreigner-friendly agency.',
      descriptionJp: '秋葉原近くの1LDKアパート。外国人向け不動産会社。',
      location: 'Akihabara',
    }
  ];
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });