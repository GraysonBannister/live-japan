import { prisma } from '../app/lib/prisma';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

// ScraperAPI configuration
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
const USE_SCRAPER_API = !!SCRAPER_API_KEY;

// Convert DMS (Degrees Minutes Seconds) to decimal
function dmsToDecimal(degrees: number, minutes: number, seconds: number, direction: string): number {
  let decimal = degrees + minutes / 60 + seconds / 3600;
  if (direction === 'S' || direction === 'W') {
    decimal = -decimal;
  }
  return decimal;
}

// Parse coordinates from various formats
function parseCoordinates(text: string): { lat: number; lng: number } | null {
  // Try to match Google Maps coordinates like "43°05'54.8"N 141°20'28.6"E"
  const dmsMatch = text.match(/(\d+)°(\d+)'([\d.]+)"?([NS])\s+(\d+)°(\d+)'([\d.]+)"?([EW])/);
  if (dmsMatch) {
    const lat = dmsToDecimal(
      parseInt(dmsMatch[1]),
      parseInt(dmsMatch[2]),
      parseFloat(dmsMatch[3]),
      dmsMatch[4]
    );
    const lng = dmsToDecimal(
      parseInt(dmsMatch[5]),
      parseInt(dmsMatch[6]),
      parseFloat(dmsMatch[7]),
      dmsMatch[8]
    );
    return { lat, lng };
  }
  
  // Try decimal format like "43.131944, 141.341278"
  const decimalMatch = text.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (decimalMatch) {
    return {
      lat: parseFloat(decimalMatch[1]),
      lng: parseFloat(decimalMatch[2])
    };
  }
  
  // Try @lat,lng format from Google Maps URLs
  const atMatch = text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return {
      lat: parseFloat(atMatch[1]),
      lng: parseFloat(atMatch[2])
    };
  }
  
  return null;
}

// Extract coordinates from Google Maps embed URL
function parseGoogleMapsUrl(url: string): { lat: number; lng: number } | null {
  // Look for &q= parameter with coordinates
  const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) {
    return {
      lat: parseFloat(qMatch[1]),
      lng: parseFloat(qMatch[2])
    };
  }
  
  // Look for @lat,lng in URL
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return {
      lat: parseFloat(atMatch[1]),
      lng: parseFloat(atMatch[2])
    };
  }
  
  // Look for !3d lat and !4d lng in Google Maps embed
  const latMatch = url.match(/!3d(-?\d+\.\d+)/);
  const lngMatch = url.match(/!4d(-?\d+\.\d+)/);
  if (latMatch && lngMatch) {
    return {
      lat: parseFloat(latMatch[1]),
      lng: parseFloat(lngMatch[1])
    };
  }
  
  return null;
}

async function fixCoordinates() {
  console.log('Starting coordinate fix process...\n');
  
  // Find properties near Tokyo Station (default coordinates)
  const tokyoLat = 35.6812;
  const tokyoLng = 139.7671;
  const threshold = 0.02; // About 2km radius
  
  const properties = await prisma.property.findMany({
    where: {
      sourceUrl: { contains: 'weeklyandmonthly.com' },
      AND: [
        { lat: { gte: tokyoLat - threshold } },
        { lat: { lte: tokyoLat + threshold } },
        { lng: { gte: tokyoLng - threshold } },
        { lng: { lte: tokyoLng + threshold } },
      ]
    },
  });
  
  console.log(`Found ${properties.length} properties near Tokyo Station that need fixing\n`);
  
  if (properties.length === 0) {
    console.log('No properties need coordinate fixes.');
    return;
  }
  
  let browser: any = null;
  
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
    
    let updated = 0;
    let failed = 0;
    let noCoordsFound = 0;
    
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      console.log(`[${i + 1}/${properties.length}] Processing: ${property.location.substring(0, 50)}...`);
      console.log(`  Current: ${property.lat}, ${property.lng}`);
      
      try {
        if (!property.sourceUrl) {
          console.log('  ✗ No source URL');
          failed++;
          continue;
        }
        
        // Visit the detail page
        await page.goto(property.sourceUrl, { 
          waitUntil: 'domcontentloaded', 
          timeout: 15000 
        });
        
        await new Promise(r => setTimeout(r, 1500));
        
        // Extract coordinates from various sources
        const coordData = await page.evaluate(() => {
          let lat: number | null = null;
          let lng: number | null = null;
          let source = '';
          
          // 1. Try to find coordinates in Google Maps iframe src
          const mapIframe = document.querySelector('iframe[src*="google.com/maps"]');
          if (mapIframe) {
            const src = mapIframe.getAttribute('src') || '';
            return { mapUrl: src, method: 'iframe' };
          }
          
          // 2. Try to find coordinates in any iframe
          const anyIframe = document.querySelector('iframe');
          if (anyIframe) {
            const src = anyIframe.getAttribute('src') || '';
            if (src.includes('google') || src.includes('map')) {
              return { mapUrl: src, method: 'any_iframe' };
            }
          }
          
          // 3. Look for coordinates in page text
          const pageText = document.body.innerText || '';
          
          // Pattern: 43°05'54.8"N 141°20'28.6"E
          const dmsPattern = /(\d+)°(\d+)'([\d.]+)"?([NS])\s+(\d+)°(\d+)'([\d.]+)"?([EW])/;
          const dmsMatch = pageText.match(dmsPattern);
          if (dmsMatch) {
            return { 
              coords: {
                lat: parseInt(dmsMatch[1]) + parseInt(dmsMatch[2])/60 + parseFloat(dmsMatch[3])/3600 * (dmsMatch[4] === 'S' ? -1 : 1),
                lng: parseInt(dmsMatch[5]) + parseInt(dmsMatch[6])/60 + parseFloat(dmsMatch[7])/3600 * (dmsMatch[8] === 'W' ? -1 : 1)
              },
              method: 'dms_text'
            };
          }
          
          // 4. Look for decimal coordinates
          const decimalPattern = /(-?\d+\.\d{5,})\s*,\s*(-?\d+\.\d{5,})/;
          const decimalMatch = pageText.match(decimalPattern);
          if (decimalMatch) {
            const latVal = parseFloat(decimalMatch[1]);
            const lngVal = parseFloat(decimalMatch[2]);
            // Validate reasonable Japan coordinates
            if (latVal > 20 && latVal < 50 && lngVal > 120 && lngVal < 150) {
              return { coords: { lat: latVal, lng: lngVal }, method: 'decimal_text' };
            }
          }
          
          // 5. Extract full address from 所在地
          let fullAddress = '';
          document.querySelectorAll('th, dt, .label').forEach((label) => {
            const labelText = label.textContent?.trim() || '';
            const valueEl = label.nextElementSibling || label.closest('tr')?.querySelector('td, dd');
            const valueText = valueEl?.textContent?.trim() || '';
            
            if (labelText.includes('所在地')) {
              fullAddress = valueText;
            }
          });
          
          return { fullAddress, method: 'address_only' };
        });
        
        let newLat: number | undefined;
        let newLng: number | undefined;
        
        // Parse coordinates from map URL if found
        if (coordData.mapUrl) {
          const parsed = parseGoogleMapsUrl(coordData.mapUrl);
          if (parsed) {
            newLat = parsed.lat;
            newLng = parsed.lng;
            console.log(`  ✓ Found coords in ${coordData.method}: ${newLat}, ${newLng}`);
          }
        }
        
        // Use coordinates from text if found
        if (!newLat && coordData.coords) {
          newLat = coordData.coords.lat;
          newLng = coordData.coords.lng;
          console.log(`  ✓ Found coords in ${coordData.method}: ${newLat}, ${newLng}`);
        }
        
        // Update the property if we found new coordinates
        if (newLat && newLng) {
          // Validate coordinates are in Japan
          if (newLat > 20 && newLat < 50 && newLng > 120 && newLng < 150) {
            await prisma.property.update({
              where: { id: property.id },
              data: { lat: newLat, lng: newLng },
            });
            console.log(`  ✓ Updated coordinates!`);
            updated++;
          } else {
            console.log(`  ⚠ Coordinates outside Japan range: ${newLat}, ${newLng}`);
            noCoordsFound++;
          }
        } else {
          console.log(`  ⚠ No coordinates found (method: ${coordData.method})`);
          if (coordData.fullAddress) {
            console.log(`     Address: ${coordData.fullAddress.substring(0, 60)}...`);
          }
          noCoordsFound++;
        }
        
      } catch (error) {
        console.log(`  ✗ Error: ${(error as Error).message.substring(0, 50)}`);
        failed++;
      }
      
      // Small delay between requests
      await new Promise(r => setTimeout(r, 800));
    }
    
    console.log(`\n✓ Coordinate fix complete!`);
    console.log(`  Updated: ${updated} properties`);
    console.log(`  No coords found: ${noCoordsFound} properties`);
    console.log(`  Failed: ${failed} properties`);
    
  } catch (error) {
    console.error('Error during coordinate fix:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

fixCoordinates();
