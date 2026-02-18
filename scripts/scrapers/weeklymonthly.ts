import { ListingSource } from '../ingest';

/**
 * Puppeteer scraper for weeklyandmonthly.com
 * This site is JavaScript-rendered, so we need a headless browser
 */
export async function fetchRealListings(): Promise<ListingSource[]> {
  const listings: ListingSource[] = [];
  let browser: any = null;
  
  // Dynamic import puppeteer to avoid TypeScript issues
  const puppeteer = await import('puppeteer');
  
  try {
    console.log('Launching headless browser...');
    browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    console.log('Navigating to weeklyandmonthly.com/tokyo/...');
    await page.goto('https://weeklyandmonthly.com/tokyo/', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    
    // Wait for property listings to load
    await page.waitForSelector('.room-item, .property-item, article, .list-item', {
      timeout: 10000,
    }).catch(() => console.log('Standard selectors not found, trying alternatives...'));
    
    // Extract listing data
    const scrapedData = await page.evaluate(() => {
      const items: Array<{
        title: string;
        price: number;
        location: string;
        station: string;
        walkTime: number;
        url: string;
        photos: string[];
      }> = [];
      
      // Try multiple selectors to find property cards
      const selectors = [
        '.room-item',
        '.property-item', 
        'article.room',
        '.list-item',
        '[class*="room"]',
        '[class*="property"]',
      ];
      
      for (const selector of selectors) {
        document.querySelectorAll(selector).forEach((el) => {
          // Title
          const titleEl = el.querySelector('h3, .title, [class*="title"], .name');
          const title = titleEl?.textContent?.trim() || '';
          
          // Price - look for yen symbol
          const priceEl = el.querySelector('.price, [class*="price"], .rent');
          const priceText = priceEl?.textContent?.trim() || '';
          const priceMatch = priceText.match(/([\d,]+)/);
          const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ''), 10) : 0;
          
          // Location
          const locEl = el.querySelector('.location, .address, [class*="location"], [class*="area"]');
          const location = locEl?.textContent?.trim() || '';
          
          // Station info
          const stationEl = el.querySelector('.station, .access, [class*="station"], [class*="access"]');
          const stationText = stationEl?.textContent?.trim() || '';
          const walkMatch = stationText.match(/徒歩\s*(\d+)\s*分/);
          const walkTime = walkMatch ? parseInt(walkMatch[1], 10) : 10;
          const stationMatch = stationText.match(/「(.+?)」/);
          const station = stationMatch ? stationMatch[1] : 'Tokyo Station';
          
          // Link
          const linkEl = el.querySelector('a');
          const href = linkEl?.getAttribute('href') || '';
          const url = href.startsWith('http') ? href : `https://weeklyandmonthly.com${href}`;
          
          // Photos
          const photos: string[] = [];
          el.querySelectorAll('img').forEach((img) => {
            const src = img.getAttribute('src') || img.getAttribute('data-src');
            if (src && src.length > 0 && !src.includes('logo') && !src.includes('icon')) {
              const fullSrc = src.startsWith('http') ? src : `https://weeklyandmonthly.com${src}`;
              if (!photos.includes(fullSrc)) {
                photos.push(fullSrc);
              }
            }
          });
          
          if (title && price > 30000 && url) {
            items.push({ title, price, location, station, walkTime, url, photos });
          }
        });
      }
      
      return items;
    });
    
    console.log(`Found ${scrapedData.length} listings with Puppeteer`);
    
    // Convert to ListingSource format
    scrapedData.forEach((item: { title: string; price: number; location: string; station: string; walkTime: number; url: string; photos: string[] }, i: number) => {
      listings.push({
        externalId: `wm-tokyo-${i}`,
        sourceUrl: item.url,
        type: 'monthly_mansion',
        price: item.price,
        deposit: null,
        keyMoney: null,
        nearestStation: item.station,
        walkTime: item.walkTime,
        furnished: true,
        foreignerFriendly: true,
        photos: item.photos,
        descriptionEn: item.title,
        descriptionJp: item.title,
        location: item.location || 'Tokyo',
      });
    });
    
    // If we found listings, fetch more photos from detail pages
    if (listings.length > 0) {
      console.log('Fetching additional photos from detail pages...');
      for (let i = 0; i < Math.min(listings.length, 5); i++) {
        try {
          await page.goto(listings[i].sourceUrl, { waitUntil: 'networkidle2', timeout: 20000 });
          await page.waitForTimeout(2000); // Wait for images to load
          
          const detailPhotos = await page.evaluate(() => {
            const photos: string[] = [];
            document.querySelectorAll('.gallery img, .photo img, .swiper-slide img, .room-photo img').forEach((img) => {
              const src = img.getAttribute('src') || img.getAttribute('data-src');
              if (src) {
                const fullSrc = src.startsWith('http') ? src : `https://weeklyandmonthly.com${src}`;
                if (!photos.includes(fullSrc)) photos.push(fullSrc);
              }
            });
            return photos;
          });
          
          if (detailPhotos.length > 0) {
            listings[i].photos = detailPhotos;
          }
        } catch (e) {
          // Keep existing photos
        }
      }
    }
    
  } catch (error) {
    console.error('Error with Puppeteer scraper:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  return listings;
}