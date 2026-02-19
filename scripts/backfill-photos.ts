/**
 * Backfill missing photos for existing listings
 * Uses standard delay instead of deprecated page.waitForTimeout
 */

import { prisma } from '../app/lib/prisma';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

// Helper for delay that works in all puppeteer versions
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function backfillPhotos() {
  console.log('=== Backfilling Missing Photos ===\n');
  
  // Find listings with no photos
  const properties = await prisma.property.findMany({
    where: {
      photos: {
        equals: [],
      },
    },
    take: 40,
  });
  
  console.log(`Found ${properties.length} listings without photos`);
  
  if (properties.length === 0) {
    console.log('No listings need backfilling');
    return;
  }
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      ...(SCRAPER_API_KEY ? ['--proxy-server=http://proxy-server.scraperapi.com:8001'] : []),
    ],
  });
  
  const page = await browser.newPage();
  
  if (SCRAPER_API_KEY) {
    await page.authenticate({ username: 'scraperapi', password: SCRAPER_API_KEY });
  }
  
  let updated = 0;
  let failed = 0;
  
  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    console.log(`\n[${i + 1}/${properties.length}] ${property.location.substring(0, 40)}...`);
    
    try {
      if (!property.sourceUrl) {
        console.log('  No source URL');
        failed++;
        continue;
      }
      
      await page.goto(property.sourceUrl, { waitUntil: 'networkidle2', timeout: 20000 });
      await delay(2000);
      
      // Extract photos
      const photos = await page.evaluate(() => {
        const allPhotos: string[] = [];
        document.querySelectorAll('img').forEach((img) => {
          const src = img.getAttribute('src') || img.getAttribute('data-src');
          if (src && src.includes('imageflux') && !allPhotos.includes(src)) {
            allPhotos.push(src);
          }
        });
        return allPhotos.slice(0, 10);
      });
      
      if (photos.length > 0) {
        await prisma.property.update({
          where: { id: property.id },
          data: { photos },
        });
        console.log(`  ✓ ${photos.length} photos`);
        updated++;
      } else {
        console.log('  ✗ No photos');
        failed++;
      }
      
    } catch (error) {
      console.log(`  ✗ ${(error as Error).message.substring(0, 40)}`);
      failed++;
    }
  }
  
  await browser.close();
  
  console.log(`\n=== Done: ${updated} updated, ${failed} failed ===`);
}

backfillPhotos()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
