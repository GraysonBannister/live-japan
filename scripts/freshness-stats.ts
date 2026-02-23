#!/usr/bin/env node
/**
 * Freshness statistics script
 * Run via: npx ts-node scripts/freshness-stats.ts
 * 
 * Shows current freshness statistics
 */

import { prisma } from '../app/lib/prisma';

async function main() {
  console.log('=== Listing Freshness Statistics ===\n');
  
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Get statistics
  const [
    totalActive,
    totalHidden,
    expiringSoon,
    lowConfidence,
    recentlyUpdated,
    staleListings,
    byStatus,
    avgConfidence,
  ] = await Promise.all([
    prisma.property.count({ where: { isActive: true } }),
    prisma.property.count({ where: { isActive: false } }),
    prisma.property.count({
      where: {
        isActive: true,
        autoHideAfter: {
          gte: now,
          lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.property.count({
      where: {
        isActive: true,
        statusConfidenceScore: { lt: 30 },
      },
    }),
    prisma.property.count({
      where: {
        isActive: true,
        lastScrapedAt: { gte: sevenDaysAgo },
      },
    }),
    prisma.property.count({
      where: {
        isActive: true,
        OR: [
          { lastScrapedAt: { lt: fourteenDaysAgo } },
          { lastScrapedAt: null },
        ],
      },
    }),
    prisma.property.groupBy({
      by: ['availabilityStatus'],
      where: { isActive: true },
      _count: { availabilityStatus: true },
    }),
    prisma.property.aggregate({
      where: { isActive: true },
      _avg: { statusConfidenceScore: true },
    }),
  ]);
  
  console.log(`Timestamp: ${now.toISOString()}\n`);
  
  console.log('--- Overview ---');
  console.log(`Total active listings: ${totalActive}`);
  console.log(`Total hidden listings: ${totalHidden}`);
  console.log(`Average confidence score: ${avgConfidence._avg.statusConfidenceScore?.toFixed(1) || 'N/A'}/100\n`);
  
  console.log('--- Health Metrics ---');
  console.log(`Recently updated (≤7 days): ${recentlyUpdated} (${((recentlyUpdated / totalActive) * 100).toFixed(1)}%)`);
  console.log(`Stale listings (>14 days): ${staleListings} (${((staleListings / totalActive) * 100).toFixed(1)}%)`);
  console.log(`Expiring in next 3 days: ${expiringSoon}`);
  console.log(`Low confidence (<30): ${lowConfidence}\n`);
  
  console.log('--- By Availability Status ---');
  const statusCounts = byStatus.reduce((acc, item) => {
    acc[item.availabilityStatus] = item._count.availabilityStatus;
    return acc;
  }, {} as Record<string, number>);
  
  const statusLabels: Record<string, string> = {
    unknown: 'Unknown',
    available: 'Available',
    likely_available: 'Likely Available',
    probably_unavailable: 'Probably Unavailable',
    unavailable: 'Unavailable',
  };
  
  for (const [status, count] of Object.entries(statusCounts)) {
    const label = statusLabels[status] || status;
    const pct = ((count / totalActive) * 100).toFixed(1);
    console.log(`  ${label}: ${count} (${pct}%)`);
  }
  
  // Top 10 lowest confidence listings
  console.log('\n--- Lowest Confidence Listings (Top 10) ---');
  const lowConfidenceListings = await prisma.property.findMany({
    where: { isActive: true },
    orderBy: { statusConfidenceScore: 'asc' },
    take: 10,
    select: {
      externalId: true,
      location: true,
      statusConfidenceScore: true,
      lastScrapedAt: true,
      availabilityStatus: true,
    },
  });
  
  for (const listing of lowConfidenceListings) {
    const lastUpdate = listing.lastScrapedAt 
      ? `${Math.floor((now.getTime() - listing.lastScrapedAt.getTime()) / (1000 * 60 * 60 * 24))} days ago`
      : 'never';
    console.log(`  ${listing.externalId}: ${listing.location} (Score: ${listing.statusConfidenceScore}, Last: ${lastUpdate})`);
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
