import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

// Sample real data structure - replace with actual scraper or API
interface ListingSource {
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
          console.log(`Updated: ${listing.externalId} (${listing.location})`);
        } else {
          results.skipped++;
          console.log(`Skipped (no changes): ${listing.externalId}`);
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
        console.log(`Created: ${listing.externalId} (${listing.location})`);
      }
    } catch (error) {
      const errorMsg = `Failed to process ${listing.externalId}: ${error}`;
      results.errors.push(errorMsg);
      console.error(errorMsg);
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
  
  console.log(`Removed ${result.count} stale listings`);
  return result.count;
}

// Example usage with sample data
async function main() {
  // This is sample data - replace with actual API/scraper calls
  const sampleListings: ListingSource[] = [
    {
      externalId: 'sakura-housing-001',
      sourceUrl: 'https://example.com/listings/001',
      type: 'monthly_mansion',
      price: 120000,
      deposit: 120000,
      keyMoney: 0,
      nearestStation: 'Shibuya Station',
      walkTime: 8,
      furnished: true,
      foreignerFriendly: true,
      photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
      descriptionEn: 'Modern monthly mansion in Shibuya, fully furnished with high-speed internet.',
      descriptionJp: '渋谷のモダンなマンスリーマンション。家具付き、高速インターネット完備。',
      location: 'Shibuya',
      lat: 35.6595,
      lng: 139.7004,
      availableFrom: new Date('2026-03-01')
    },
    {
      externalId: 'tokyo-rentals-042',
      sourceUrl: 'https://example.com/listings/042',
      type: 'apartment',
      price: 95000,
      deposit: 95000,
      keyMoney: 95000,
      nearestStation: 'Shinjuku Station',
      walkTime: 12,
      furnished: false,
      foreignerFriendly: true,
      photos: ['https://example.com/photo3.jpg'],
      descriptionEn: 'Spacious 1LDK apartment near Shinjuku, great for long-term stays.',
      descriptionJp: '新宿近くの広々とした1LDKアパート。長期滞在に最適。',
      location: 'Shinjuku',
      lat: 35.6938,
      lng: 139.7034
    }
  ];

  console.log('Starting data ingestion...\n');
  
  const results = await ingestProperties(sampleListings);
  
  console.log('\n--- Ingestion Summary ---');
  console.log(`Created: ${results.created}`);
  console.log(`Updated: ${results.updated}`);
  console.log(`Skipped: ${results.skipped}`);
  console.log(`Errors: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach(err => console.log(`  - ${err}`));
  }
  
  // Optional: Remove listings that no longer exist in source
  // const activeIds = sampleListings.map(l => l.externalId);
  // await removeStaleListings(activeIds);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export { prisma };