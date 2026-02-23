#!/usr/bin/env node
/**
 * Force translate all Japanese property descriptions to English
 * Run: DEEPL_API_KEY="xxx" npx tsx scripts/force-translate.ts
 */

import { prisma } from '../app/lib/prisma';
import { translateToEnglish, isTranslationAvailable, getTranslationUsage } from '../app/lib/translation';

async function main() {
  console.log('=== Force Translation of All Japanese Descriptions ===\n');

  if (!isTranslationAvailable()) {
    console.error('❌ DeepL API key not set.');
    process.exit(1);
  }

  const usage = await getTranslationUsage();
  if (usage) {
    console.log(`📊 API Usage: ${usage.characterCount.toLocaleString()} / ${usage.characterLimit.toLocaleString()} characters (${((usage.characterCount/usage.characterLimit)*100).toFixed(1)}%)`);
    console.log();
  }

  // Get all listings with Japanese descriptions
  const listings = await prisma.property.findMany({
    where: {
      descriptionJp: { not: null },
    },
  });

  console.log(`Found ${listings.length} listings with Japanese text\n`);

  let successCount = 0;
  let failCount = 0;
  let charCount = 0;

  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i];
    const jpText = listing.descriptionJp!;
    
    console.log(`[${i + 1}/${listings.length}] ${listing.externalId}: ${listing.location.substring(0, 40)}...`);
    
    const translated = await translateToEnglish(jpText);
    charCount += jpText.length;
    
    if (translated) {
      await prisma.property.update({
        where: { id: listing.id },
        data: {
          descriptionEn: translated,
        },
      });
      
      console.log(`  ✓ Translated (${jpText.length} chars)`);
      console.log(`    ${translated.substring(0, 100)}...`);
      successCount++;
    } else {
      console.log(`  ✗ Failed`);
      failCount++;
    }
    
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n=== Summary ===');
  console.log(`Success: ${successCount}, Failed: ${failCount}`);
  console.log(`Total characters: ${charCount.toLocaleString()}`);
  
  if (usage) {
    const newUsage = await getTranslationUsage();
    if (newUsage) {
      console.log(`API used this run: ${(newUsage.characterCount - usage.characterCount).toLocaleString()}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
