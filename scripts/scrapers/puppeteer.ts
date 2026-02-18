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
   * Scrape Sakura House with headless browser
   */
  async scrapeSakuraHouse(): Promise<ListingSource[]> {
    if (!this.browser) await this.init();
    
    const listings: ListingSource[] = [];
    const page = await this.browser!.newPage();
    
    try {
      // Set user agent to look like a real browser
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
      
      // Navigate to property list
      await page.goto('https://www.sakura-house.com/all/', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
      
      // Wait for property listings to load
      await page.waitForSelector('.property, .building, article, [class*="property"]', {
        timeout: 10000,
      }).catch(() => console.log('No standard property selectors found'));
      
      // Extract property data
      const properties = await page.evaluate(() => {
        const items: Array<{
          title: string;
          price: number | null;
          location: string;
          url: string;
        }> = [];
        
        // Try multiple selectors
        const selectors = [
          '.property',
          '.building',
          'article',
          '[class*="property"]',
          '.listing',
          '.room',
        ];
        
        for (const selector of selectors) {
          document.querySelectorAll(selector).forEach((el) => {
            const title = el.querySelector('h2, h3, .title, .name')?.textContent?.trim() || '';
            const priceText = el.querySelector('.price, [class*="price"]')?.textContent?.trim() || '';
            const location = el.querySelector('.location, .address, [class*="location"]')?.textContent?.trim() || '';
            const link = el.querySelector('a')?.getAttribute('href') || '';
            
            // Extract price number
            const priceMatch = priceText.replace(/,/g, '').match(/[\d,]+/);
            const price = priceMatch ? parseInt(priceMatch[0].replace(/,/g, ''), 10) : null;
            
            if (title && price && price > 30000) {
              items.push({ title, price, location, url: link });
            }
          });
        }
        
        return items;
      });
      
      // Convert to ListingSource format
      properties.forEach((prop, i) => {
        if (!prop.price) return;
        listings.push({
          externalId: `sakura-${i}`,
          sourceUrl: prop.url.startsWith('http') ? prop.url : `https://www.sakura-house.com${prop.url}`,
          type: 'monthly_mansion',
          price: prop.price,
          deposit: null,
          keyMoney: null,
          nearestStation: prop.location || 'Tokyo',
          walkTime: 10,
          furnished: true,
          foreignerFriendly: true,
          photos: [],
          descriptionEn: `${prop.title} - Furnished share house/apartment`,
          location: prop.location || 'Tokyo',
        });
      });
      
      console.log(`Sakura House: Found ${listings.length} listings`);
      
    } catch (error) {
      console.error('Sakura House scraping failed:', error);
    } finally {
      await page.close();
    }
    
    return listings;
  }

  /**
   * Scrape Oakhouse with headless browser
   */
  async scrapeOakhouse(): Promise<ListingSource[]> {
    if (!this.browser) await this.init();
    
    const listings: ListingSource[] = [];
    const page = await this.browser!.newPage();
    
    try {
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
      
      await page.goto('https://www.oakhouse.jp/eng/house/', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
      
      await page.waitForSelector('.house, .property, article', {
        timeout: 10000,
      }).catch(() => console.log('No standard selectors found'));
      
      const properties = await page.evaluate(() => {
        const items: Array<{
          title: string;
          price: number | null;
          station: string;
          url: string;
        }> = [];
        
        document.querySelectorAll('.house, .property, article, [class*="house"]').forEach((el) => {
          const title = el.querySelector('h2, h3, .title')?.textContent?.trim() || '';
          const priceText = el.querySelector('.price, .rent')?.textContent?.trim() || '';
          const stationText = el.querySelector('.station, .access')?.textContent?.trim() || '';
          const link = el.querySelector('a')?.getAttribute('href') || '';
          
          const priceMatch = priceText.replace(/,/g, '').match(/[\d,]+/);
          const price = priceMatch ? parseInt(priceMatch[0].replace(/,/g, ''), 10) : null;
          
          if (title && price && price > 30000) {
            items.push({ title, price, station: stationText, url: link });
          }
        });
        
        return items;
      });
      
      properties.forEach((prop, i) => {
        if (!prop.price) return;
        const walkMatch = prop.station.match(/(\d+)\s*min/);
        listings.push({
          externalId: `oakhouse-${i}`,
          sourceUrl: prop.url.startsWith('http') ? prop.url : `https://www.oakhouse.jp${prop.url}`,
          type: 'monthly_mansion',
          price: prop.price,
          deposit: null,
          keyMoney: null,
          nearestStation: prop.station.split(' ')[0] || 'Tokyo Station',
          walkTime: walkMatch ? parseInt(walkMatch[1], 10) : 10,
          furnished: true,
          foreignerFriendly: true,
          photos: [],
          descriptionEn: `${prop.title} - Social apartment`,
          location: 'Tokyo',
        });
      });
      
      console.log(`Oakhouse: Found ${listings.length} listings`);
      
    } catch (error) {
      console.error('Oakhouse scraping failed:', error);
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
      
      // Scrape Sakura House
      console.log(' Scraping Sakura House...');
      const sakuraListings = await this.scrapeSakuraHouse();
      allListings.push(...sakuraListings);
      
      // Scrape Oakhouse
      console.log(' Scraping Oakhouse...');
      const oakhouseListings = await this.scrapeOakhouse();
      allListings.push(...oakhouseListings);
      
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

// PuppeteerScraper exported above