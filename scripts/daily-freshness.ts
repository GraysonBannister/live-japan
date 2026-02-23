#!/usr/bin/env node
/**
 * Daily freshness maintenance script
 * Run via: npx ts-node scripts/daily-freshness.ts
 * Or: node scripts/daily-freshness.js (after compilation)
 * 
 * This script:
 * 1. Auto-hides listings past their expiry date
 * 2. Updates confidence scores
 * 3. Flags stale listings
 */

import { prisma } from '../app/lib/prisma';
import { calculateConfidenceScore, shouldAutoHide } from '../app/lib/freshness';

async function main() {
  console.log('=== Daily Freshness Maintenance ===\n');
  
  const results = {
    hidden: 0,
    confidenceUpdated: 0,
    flagged: 0,
    errors: [] as string[],
  };
  
  // 1. Auto-hide expired listings
  const now = new Date();
  console.log('Step 1: Hiding expired listings...');
  
  const expiredListings = await prisma.property.findMany({
    where: {
      isActive: true,
      autoHideAfter: {
        lt: now,
      },
    },
    select: {
      id: true,
      externalId: true,
    },
  });
  
  for (const listing of expiredListings) {
    try {
      await prisma.property.update({
        where: { id: listing.id },
        data: {
          isActive: false,
          availabilityStatus: 'probably_unavailable',
        },
      });
      results.hidden++;
      console.log(`  Hidden: ${listing.externalId}`);
    } catch (error) {
      results.errors.push(`Failed to hide ${listing.externalId}: ${error}`);
    }
  }
  
  console.log(`  ✓ Hidden ${results.hidden} expired listings\n`);
  
  // 2. Update confidence scores for active listings
  console.log('Step 2: Updating confidence scores...');
  
  const activeListings = await prisma.property.findMany({
    where: {
      isActive: true,
    },
  });
  
  for (const listing of activeListings) {
    try {
      const newScore = calculateConfidenceScore(listing);
      
      // Only update if score changed significantly
      if (Math.abs(newScore - listing.statusConfidenceScore) >= 5) {
        await prisma.property.update({
          where: { id: listing.id },
          data: {
            statusConfidenceScore: newScore,
          },
        });
        results.confidenceUpdated++;
      }
      
      // Flag listings with very low confidence
      if (newScore < 20) {
        results.flagged++;
      }
    } catch (error) {
      results.errors.push(`Failed to update confidence for ${listing.externalId}: ${error}`);
    }
  }
  
  console.log(`  ✓ Updated ${results.confidenceUpdated} confidence scores`);
  console.log(`  ⚠ ${results.flagged} listings have very low confidence\n`);
  
  // 3. Mark listings not seen in 30+ days as probably unavailable
  console.log('Step 3: Flagging stale listings...');
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const staleListings = await prisma.property.findMany({
    where: {
      isActive: true,
      OR: [
        {
          lastScrapedAt: {
            lt: thirtyDaysAgo,
          },
        },
        {
          lastScrapedAt: null,
        },
      ],
    },
    select: {
      id: true,
      externalId: true,
    },
  });
  
  for (const listing of staleListings) {
    try {
      await prisma.property.update({
        where: { id: listing.id },
        data: {
          availabilityStatus: 'probably_unavailable',
          statusConfidenceScore: {
            decrement: 10,
          },
        },
      });
    } catch (error) {
      results.errors.push(`Failed to flag stale listing ${listing.externalId}: ${error}`);
    }
  }
  
  console.log(`  ✓ Flagged ${staleListings.length} stale listings\n`);
  
  // Summary
  console.log('=== Summary ===');
  console.log(`Timestamp: ${now.toISOString()}`);
  console.log(`Listings hidden: ${results.hidden}`);
  console.log(`Confidence scores updated: ${results.confidenceUpdated}`);
  console.log(`Low confidence flagged: ${results.flagged}`);
  console.log(`Stale listings checked: ${staleListings.length}`);
  
  if (results.errors.length > 0) {
    console.log(`\nErrors (${results.errors.length}):`);
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
