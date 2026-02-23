import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { calculateConfidenceScore, shouldAutoHide } from '../../../lib/freshness';

/**
 * Daily freshness maintenance endpoint
 * Should be called by cron job (e.g., Vercel Cron)
 * 
 * Environment variable for security:
 * CRON_SECRET - must match the secret sent in the request
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;
    
    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const results = {
      hidden: 0,
      confidenceUpdated: 0,
      flagged: 0,
      errors: [] as string[],
    };
    
    // 1. Auto-hide expired listings
    const now = new Date();
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
      } catch (error) {
        results.errors.push(`Failed to hide ${listing.externalId}: ${error}`);
      }
    }
    
    // 2. Update confidence scores for active listings
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
    
    // 3. Mark listings not seen in 30+ days as probably unavailable
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
        results.errors.push(`Failed to flag stale listing ${listing.id}: ${error}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      summary: {
        listingsHidden: results.hidden,
        confidenceScoresUpdated: results.confidenceUpdated,
        lowConfidenceFlagged: results.flagged,
        staleListingsChecked: staleListings.length,
      },
      errors: results.errors.length > 0 ? results.errors : undefined,
    });
    
  } catch (error) {
    console.error('Daily freshness check failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for manual testing/monitoring
 * Returns current freshness statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Simple auth check
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;
    
    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Get statistics
    const [
      totalActive,
      totalHidden,
      expiringSoon, // Expires in next 3 days
      lowConfidence, // Score < 30
      recentlyUpdated, // Updated in last 7 days
      staleListings, // Not updated in 14+ days
      byStatus,
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
    ]);
    
    return NextResponse.json({
      timestamp: now.toISOString(),
      summary: {
        totalActive,
        totalHidden,
        expiringSoon,
        lowConfidence,
        recentlyUpdated,
        staleListings,
      },
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.availabilityStatus] = item._count.availabilityStatus;
        return acc;
      }, {} as Record<string, number>),
    });
    
  } catch (error) {
    console.error('Freshness stats failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
