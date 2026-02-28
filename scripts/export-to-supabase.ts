#!/usr/bin/env node
/**
 * Export PostgreSQL listings to Supabase
 * Run: npx tsx scripts/export-to-supabase.ts
 */

import 'dotenv/config';
import { prisma } from '../app/lib/prisma';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xtrdlxzpdmszjhfrwhxz.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0cmRseHpwZG1zempoZnJ3aHh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg1NTE2NCwiZXhwIjoyMDg3NDMxMTY0fQ.u-lwqvCAO2kcUpaJrbF-FSZdquHtoLUj7-Z0pIQKQBo';

// Create admin client with service role key (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  console.log('=== Exporting Listings to Supabase ===\n');

  // Get all listings from SQLite
  const listings = await prisma.property.findMany();
  console.log(`Found ${listings.length} listings in SQLite\n`);

  if (listings.length === 0) {
    console.log('No listings to export');
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const listing of listings) {
    try {
      // Map SQLite field names to Supabase snake_case
      const data = {
        external_id: listing.externalId,
        source_url: listing.sourceUrl,
        type: listing.type,
        price: listing.price,
        deposit: listing.deposit,
        key_money: listing.keyMoney,
        nearest_station: listing.nearestStation,
        walk_time: listing.walkTime,
        furnished: listing.furnished,
        foreigner_friendly: listing.foreignerFriendly,
        photos: listing.photos,
        description_en: listing.descriptionEn,
        description_jp: listing.descriptionJp,
        location: listing.location,
        lat: listing.lat,
        lng: listing.lng,
        available_from: listing.availableFrom,
        
        // Freshness fields
        last_scraped_at: listing.lastScrapedAt,
        last_confirmed_available_at: listing.lastConfirmedAvailableAt,
        source_last_updated_at: listing.sourceLastUpdatedAt,
        status_confidence_score: listing.statusConfidenceScore,
        availability_status: listing.availabilityStatus,
        content_hash: listing.contentHash,
        last_content_change_at: listing.lastContentChangeAt,
        auto_hide_after: listing.autoHideAfter,
        is_active: listing.isActive,
        partner_feed: listing.partnerFeed,
        verification_status: listing.verificationStatus,
        click_count: listing.clickCount,
        inquiry_count: listing.inquiryCount,
        last_inquiry_at: listing.lastInquiryAt,
        
        created_at: listing.createdAt,
        updated_at: listing.updatedAt,
      };

      const { error } = await supabaseAdmin
        .from('properties')
        .upsert(data, { onConflict: 'external_id' });

      if (error) {
        console.log(`  ✗ ${listing.externalId}: ${error.message}`);
        failCount++;
      } else {
        console.log(`  ✓ ${listing.externalId}: ${listing.location.substring(0, 40)}...`);
        successCount++;
      }
    } catch (error) {
      console.log(`  ✗ ${listing.externalId}: ${error}`);
      failCount++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log('\n✓ Done!');
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
