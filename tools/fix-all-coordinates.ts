import { prisma } from '../app/lib/prisma';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

// ScraperAPI configuration
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
const USE_SCRAPER_API = !!SCRAPER_API_KEY;

async function fixAllCoordinates() {
  console.log('Starting comprehensive coordinate fix...\n');
  
  // Get ALL weeklyandmonthly.com properties
  const properties = await prisma.property.findMany({
    where: {
      sourceUrl: { contains: 'weeklyandmonthly.com' },
      lat: { not: null },
    },
    orderBy: { id: 'asc' },
  });
  
  console.log(`Found ${properties.length} properties to check\n`);
  
  let browser: any = null;
  let updated = 0;
  let noChange = 0;
  let failed = 0;
  
  try {
    console.log('Launching browser...');
    
    const launchArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ];
    
    if (USE_SCRAPER_API) {
      launchArgs.push('--proxy-server=http://proxy-server.scraperapi.com:8001');
    }
    
    browser = await puppeteer.launch({
      headless: true,
      args: launchArgs,
    });
    
    const page = await browser.newPage();
    
    if (USE_SCRAPER_API) {
      await page.authenticate({
        username: 'scraperapi',
        password: SCRAPER_API_KEY,
      });
    }
    
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      
      // Skip if no source URL
      if (!property.sourceUrl) {
        console.log(`[${i + 1}/${properties.length}] ID ${property.id}: No source URL`);
        noChange++;
        continue;
      }
      
      process.stdout.write(`[${i + 1}/${properties.length}] ID ${property.id}: ${property.location.substring(0, 40)}... `);
      
      try {
        // Visit the detail page
        await page.goto(property.sourceUrl, { 
          waitUntil: 'domcontentloaded', 
          timeout: 15000 
        });
        
        await new Promise(r => setTimeout(r, 1500));
        
        // Extract coordinates from Google Maps iframe
        const coords = await page.evaluate(() => {
          const mapIframe = document.querySelector('iframe[src*="google.com/maps"]');
          if (!mapIframe) return null;
          
          const src = mapIframe.getAttribute('src') || '';
          
          // Try !3d and !4d format (most common)
          const latMatch = src.match(/!3d(-?\d+\.\d+)/);
          const lngMatch = src.match(/!4d(-?\d+\.\d+)/);
          if (latMatch && lngMatch) {
            return { lat: parseFloat(latMatch[1]), lng: parseFloat(lngMatch[1]), source: '!3d/!4d' };
          }
          
          // Try q=lat,lng format
          const qMatch = src.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
          if (qMatch) {
            return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]), source: 'q=' };
          }
          
          // Try @lat,lng format
          const atMatch = src.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
          if (atMatch) {
            return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]), source: '@' };
          }
          
          return null;
        });
        
        if (!coords) {
          console.log('⚠ No map coords found');
          noChange++;
          continue;
        }
        
        // Validate coordinates are in Japan
        if (coords.lat < 20 || coords.lat > 50 || coords.lng < 120 || coords.lng > 150) {
          console.log(`⚠ Coords outside Japan: ${coords.lat}, ${coords.lng}`);
          noChange++;
          continue;
        }
        
        // Check if coordinates are significantly different (more than 100m)
        const latDiff = Math.abs((property.lat || 0) - coords.lat);
        const lngDiff = Math.abs((property.lng || 0) - coords.lng);
        const diffThreshold = 0.001; // ~100m
        
        if (latDiff < diffThreshold && lngDiff < diffThreshold) {
          console.log(`✓ Already correct (${coords.source})`);
          noChange++;
          continue;
        }
        
        // Update the property with correct coordinates
        await prisma.property.update({
          where: { id: property.id },
          data: { 
            lat: coords.lat, 
            lng: coords.lng 
          },
        });
        
        console.log(`✓ FIXED (${coords.source}): ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)} (was ${property.lat?.toFixed(6)}, ${property.lng?.toFixed(6)})`);
        updated++;
        
      } catch (error) {
        console.log(`✗ Error: ${(error as Error).message.substring(0, 40)}`);
        failed++;
      }
      
      // Delay between requests
      await new Promise(r => setTimeout(r, 800));
    }
    
    console.log(`\n✓ Coordinate fix complete!`);
    console.log(`  Updated: ${updated} properties`);
    console.log(`  Already correct: ${noChange} properties`);
    console.log(`  Failed: ${failed} properties`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

fixAllCoordinates();
