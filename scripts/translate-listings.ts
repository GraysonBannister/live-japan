#!/usr/bin/env node
/**
 * Translate Japanese property descriptions to English
 * Run: npx tsx scripts/translate-listings.ts
 * 
 * This script:
 * 1. Finds listings with Japanese descriptions but no/missing English
 * 2. Translates them using DeepL API
 * 3. Updates the database
 */

import { prisma } from '../app/lib/prisma';
import { translateToEnglish, isTranslationAvailable, getTranslationUsage } from '../app/lib/translation';

async function main() {
  console.log('=== Property Description Translation ===\n');

  // Check if translation is available
  if (!isTranslationAvailable()) {
    console.error('❌ DeepL API key not set.');
    console.log('\nTo use translation:');
    console.log('1. Get a free API key from https://www.deepl.com/pro-api');
    console.log('2. Set environment variable: export DEEPL_API_KEY="your-key"');
    console.log('\nFree tier: 500,000 characters/month');
    process.exit(1);
  }

  // Show usage stats
  const usage = await getTranslationUsage();
  if (usage) {
    const percentage = (usage.characterCount / usage.characterLimit) * 100;
    console.log(`📊 API Usage: ${usage.characterCount.toLocaleString()} / ${usage.characterLimit.toLocaleString()} characters (${percentage.toFixed(1)}%)`);
    console.log();
  }

  // Find listings needing translation
  console.log('🔍 Finding listings with Japanese descriptions...');
  
  // Get all listings with Japanese descriptions
  const listings = await prisma.property.findMany({
    where: {
      AND: [
        { descriptionJp: { not: null } },
        { descriptionJp: { not: '' } },
      ],
    },
    take: 100,
  });

  // Filter to only those needing translation
  const needsTranslation = listings.filter(l => {
    if (!l.descriptionEn) return true;
    if (l.descriptionEn === '') return true;
    if (l.descriptionEn.includes('[Translation pending]')) return true;
    return false;
  });

  console.log(`Found ${needsTranslation.length} listings needing translation\n`);

  if (needsTranslation.length === 0) {
    console.log('✅ All listings have English translations!');
    return;
  }

  let successCount = 0;
  let failCount = 0;
  let charCount = 0;

  for (let i = 0; i < needsTranslation.length; i++) {
    const listing = needsTranslation[i];
    const jpText = listing.descriptionJp!;
    
    console.log(`[${i + 1}/${needsTranslation.length}] ${listing.externalId}: ${listing.location.substring(0, 40)}...`);
    
    // Translate
    const translated = await translateToEnglish(jpText);
    charCount += jpText.length;
    
    if (translated) {
      // Update database
      await prisma.property.update({
        where: { id: listing.id },
        data: {
          descriptionEn: translated,
          contentHash: null, // Will be recalculated on next scrape
        },
      });
      
      console.log(`  ✓ Translated (${jpText.length} chars → ${translated.length} chars)`);
      console.log(`    Preview: ${translated.substring(0, 80)}...`);
      successCount++;
    } else {
      console.log(`  ✗ Translation failed`);
      failCount++;
    }
    
    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n=== Summary ===');
  console.log(`Successfully translated: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Total characters: ${charCount.toLocaleString()}`);
  
  if (usage) {
    const newUsage = await getTranslationUsage();
    if (newUsage) {
      const usedThisRun = newUsage.characterCount - usage.characterCount;
      console.log(`API characters used: ${usedThisRun.toLocaleString()}`);
      console.log(`Remaining: ${(newUsage.characterLimit - newUsage.characterCount).toLocaleString()}`);
    }
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
