/**
 * 000area-weekly.com Scraper
 * https://www.000area-weekly.com
 */

import { chromium } from 'playwright';
import { ListingSource } from '../ingest';

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

interface ZeroZeroZeroListing extends ListingSource {
  pricingPlans?: any[];
  tags?: string[];
  lat?: number;
  lng?: number;
}

export async function fetch000AreaListings(): Promise<ZeroZeroZeroListing[]> {
  const listings: ZeroZeroZeroListing[] = [];
  let browser: any = null;
  
  try {
    console.log('Launching browser for 000area-weekly.com...');
    
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        ...(SCRAPER_API_KEY ? ['--proxy-server=http://proxy-server.scraperapi.com:8001'] : []),
      ],
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    });
    
    const page = await context.newPage();
    
    if (SCRAPER_API_KEY) {
      await page.authenticate({ username: 'scraperapi', password: SCRAPER_API_KEY });
    }
    
    // Navigate to Tokyo listings
    const url = 'https://www.000area-weekly.com/tokyo/';
    console.log(`Fetching: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Extract listing URLs
    const listingUrls = await page.evaluate(() => {
      const urls: string[] = [];
      document.querySelectorAll('a[href*="/room/"], a[href*="/detail/"]').forEach((link) => {
        const href = link.getAttribute('href');
        if (href && !urls.includes(href)) {
          urls.push(href.startsWith('http') ? href : `https://www.000area-weekly.com${href}`);
        }
      });
      return urls.slice(0, 20);
    });
    
    console.log(`Found ${listingUrls.length} listing URLs`);
    
    // Scrape each listing
    for (let i = 0; i < Math.min(listingUrls.length, 10); i++) {
      const url = listingUrls[i];
      try {
        console.log(`  [${i + 1}/${Math.min(listingUrls.length, 10)}] ${url}`);
        
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);
        
        const data = await page.evaluate(() => {
          const title = document.querySelector('h1')?.textContent?.trim() || '';
          
          const priceText = document.querySelector('.price, [class*="price"]')?.textContent || '';
          const priceMatch = priceText.match(/([\d,]+)/);
          const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ''), 10) : 0;
          
          const location = document.querySelector('[class*="address"], [class*="location"]')?.textContent?.trim() || '';
          
          const stationText = document.querySelector('[class*="station"], [class*="access"]')?.textContent || '';
          const stationMatch = stationText.match(/(.+?)駅/);
          const station = stationMatch ? stationMatch[1] + '駅' : '';
          const walkMatch = stationText.match(/徒歩(\d+)分/);
          const walkTime = walkMatch ? parseInt(walkMatch[1]) : 10;
          
          const photos: string[] = [];
          document.querySelectorAll('img').forEach((img) => {
            const src = img.getAttribute('src') || img.getAttribute('data-src');
            if (src && (src.includes('.jpg') || src.includes('.jpeg'))) {
              photos.push(src.startsWith('http') ? src : `https://www.000area-weekly.com${src}`);
            }
          });
          
          const description = document.querySelector('[class*="description"], [class*="detail"]')?.textContent?.trim() || '';
          
          return { title, price, location, station, walkTime, photos: photos.slice(0, 10), description };
        });
        
        if (data.price > 30000) {
          listings.push({
            externalId: `000area-${url.match(/\d+/)?.[0] || Date.now()}`,
            sourceUrl: url,
            type: 'monthly_mansion',
            price: data.price,
            deposit: null,
            keyMoney: null,
            nearestStation: data.station,
            walkTime: data.walkTime,
            furnished: true,
            foreignerFriendly: true,
            photos: data.photos,
            descriptionEn: data.description,
            descriptionJp: data.description,
            location: data.location,
          });
        }
      } catch (e) {
        console.log(`    Error: ${e}`);
      }
    }
    
    await browser.close();
    console.log(`\n✓ Scraped ${listings.length} listings from 000area-weekly.com`);
    return listings;
    
  } catch (error) {
    console.error('000area-weekly.com scraper error:', error);
    if (browser) await browser.close();
    return [];
  }
}

if (require.main === module) {
  fetch000AreaListings().then(console.log).catch(console.error);
}
