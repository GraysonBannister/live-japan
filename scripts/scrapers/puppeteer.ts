import puppeteer, { Browser, Page } from 'puppeteer';
import { ListingSource } from '../ingest';

/**
 * Headless browser scraper using Puppeteer
 * Handles JavaScript-rendered sites that block simple HTTP requests
 */
export class PuppeteerScraper {
  private browser: Browser | null = null;

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
      ],
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Scrape Real Estate Japan with headless browser
   */
  async scrapeRealEstateJapan(): Promise<ListingSource[]> {
    if (!this.browser) await this.init();
    
    const listings: ListingSource[] = [];
    const page = await this.browser!.newPage();
    
    try {
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
      
      await page.goto('https://realestate-japan.com/property-list/', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
      
      // Wait for property listings to load
      await page.waitForSelector('.property-item, article, .listing', {
        timeout: 10000,
      }).catch(() => console.log('No standard property selectors found, trying generic...'));
      
      // Extract property data
      const properties = await page.evaluate(() => {
        const items: Array<{
          title: string;
          price: number | null;
          location: string;
          station: string;
          walkTime: number | null;
          url: string;
        }> = [];
        
        // Try multiple selectors
        const selectors = [
          '.property-item',
          'article',
          '.listing',
          '.property',
          '[class*="property"]',
        ];
        
        for (const selector of selectors) {
          document.querySelectorAll(selector).forEach((el) => {
            const title = el.querySelector('h2, h3, .title, h2 a')?.textContent?.trim() || '';
            const priceText = el.querySelector('.price, [class*="price"], .rent')?.textContent?.trim() || '';
            const location = el.querySelector('.location, .address, [class*="location"]')?.textContent?.trim() || '';
            const access = el.querySelector('.access, .station, [class*="access"]')?.textContent?.trim() || '';
            const linkEl = el.querySelector('a');
            const url = linkEl?.getAttribute('href') || '';
            
            // Extract price number
            const priceMatch = priceText.replace(/,/g, '').match(/(\d{4,6})/);
            const price = priceMatch ? parseInt(priceMatch[0], 10) : null;
            
            // Extract walk time
            const walkMatch = access.match(/(\d+)\s*min/i) || access.match(/徒歩\s*(\d+)\s*分/);
            const walkTime = walkMatch ? parseInt(walkMatch[1], 10) : null;
            
            if (title && price && price > 30000) {
              items.push({ 
                title, 
                price, 
                location, 
                station: location.split(',')[0] || 'Tokyo',
                walkTime,
                url 
              });
            }
          });
        }
        
        return items;
      });
      
      // Convert to ListingSource format
      properties.forEach((prop, i) => {
        if (!prop.price) return;
        listings.push({
          externalId: `rejp-puppeteer-${i}`,
          sourceUrl: prop.url.startsWith('http') ? prop.url : `https://realestate-japan.com${prop.url}`,
          type: 'apartment',
          price: prop.price,
          deposit: null,
          keyMoney: null,
          nearestStation: prop.station || 'Tokyo Station',
          walkTime: prop.walkTime || 10,
          furnished: prop.title.toLowerCase().includes('furnished'),
          foreignerFriendly: true,
          photos: [],
          descriptionEn: `${prop.title} - Foreigner-friendly rental`,
          descriptionJp: prop.title,
          location: prop.location || 'Tokyo',
        });
      });
      
      console.log(`Real Estate Japan: Found ${listings.length} listings`);
      
    } catch (error) {
      console.error('Real Estate Japan scraping failed:', error);
    } finally {
      await page.close();
    }
    
    return listings;
  }

  /**
   * Scrape Village House with headless browser
   */
  async scrapeVillageHouse(): Promise<ListingSource[]> {
    if (!this.browser) await this.init();
    
    const listings: ListingSource[] = [];
    const page = await this.browser!.newPage();
    
    try {
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
      
      await page.goto('https://www.village-house.jp/en/', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
      
      await page.waitForSelector('.property, .room, [class*="property"]', {
        timeout: 10000,
      }).catch(() => console.log('No standard selectors found'));
      
      const properties = await page.evaluate(() => {
        const items: Array<{
          title: string;
          price: number | null;
          location: string;
          url: string;
        }> = [];
        
        document.querySelectorAll('.property, .room, [class*="property"], [class*="room"]').forEach((el) => {
          const title = el.querySelector('h2, h3, .title, [class*="title"]')?.textContent?.trim() || '';
          const priceText = el.querySelector('.price, .rent, [class*="price"]')?.textContent?.trim() || '';
          const location = el.querySelector('.location, .address, [class*="location"]')?.textContent?.trim() || '';
          const link = el.querySelector('a')?.getAttribute('href') || '';
          
          const priceMatch = priceText.replace(/,/g, '').match(/(\d{4,6})/);
          const price = priceMatch ? parseInt(priceMatch[0], 10) : null;
          
          if (title && price && price > 20000) {
            items.push({ title, price, location, url: link });
          }
        });
        
        return items;
      });
      
      properties.forEach((prop, i) => {
        if (!prop.price) return;
        listings.push({
          externalId: `vh-puppeteer-${i}`,
          sourceUrl: prop.url.startsWith('http') ? prop.url : `https://www.village-house.jp${prop.url}`,
          type: 'apartment',
          price: prop.price,
          deposit: 0,
          keyMoney: 0,
          nearestStation: prop.location || 'Tokyo Station',
          walkTime: 10,
          furnished: false,
          foreignerFriendly: true,
          photos: [],
          descriptionEn: `${prop.title} - Budget-friendly, no key money`,
          descriptionJp: prop.title,
          location: prop.location || 'Tokyo',
        });
      });
      
      console.log(`Village House: Found ${listings.length} listings`);
      
    } catch (error) {
      console.error('Village House scraping failed:', error);
    } finally {
      await page.close();
    }
    
    return listings;
  }

  /**
   * Scrape all supported sites
   */
  async scrapeAll(): Promise<ListingSource[]> {
    const allListings: ListingSource[] = [];
    
    try {
      console.log('Initializing headless browser...\n');
      await this.init();
      
      // Scrape Real Estate Japan
      console.log(' Scraping Real Estate Japan...');
      const rejpListings = await this.scrapeRealEstateJapan();
      allListings.push(...rejpListings);
      
      // Scrape Village House
      console.log(' Scraping Village House...');
      const vhListings = await this.scrapeVillageHouse();
      allListings.push(...vhListings);
      
    } catch (error) {
      console.error('Scraping error:', error);
    } finally {
      await this.close();
    }
    
    // Deduplicate by sourceUrl
    const seen = new Set<string>();
    const unique = allListings.filter(item => {
      if (seen.has(item.sourceUrl)) return false;
      seen.add(item.sourceUrl);
      return true;
    });
    
    console.log(`\n Total unique listings: ${unique.length}`);
    return unique;
  }
}

// PuppeteerScraper is already exported above
