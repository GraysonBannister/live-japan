/**
 * Playwright Scraper with Stealth
 * Option C: More aggressive bot detection bypass using Playwright
 */

import { chromium, Browser, Page } from 'playwright';
import { ListingSource } from '../ingest';

interface ScrapedListing extends ListingSource {
  pricingPlans?: any[];
  tags?: string[];
  lat?: number;
  lng?: number;
}

export async function fetchWithPlaywright(): Promise<ScrapedListing[]> {
  const listings: ScrapedListing[] = [];
  let browser: Browser | null = null;
  
  const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
  
  try {
    console.log('Launching Playwright browser...');
    console.log(SCRAPER_API_KEY ? '✓ Using ScraperAPI' : '⚠ Direct connection');
    
    // Launch with stealth configurations
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-site-isolation-trials',
        ...(SCRAPER_API_KEY ? ['--proxy-server=http://proxy-server.scraperapi.com:8001'] : []),
      ],
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'ja-JP',
      timezoneId: 'Asia/Tokyo',
      permissions: ['geolocation'],
      geolocation: { latitude: 35.6762, longitude: 139.6503 }, // Tokyo
    });
    
    const page = await context.newPage();
    
    // Authenticate with proxy if configured
    if (SCRAPER_API_KEY) {
      await page.authenticate({
        username: 'scraperapi',
        password: SCRAPER_API_KEY,
      });
    }
    
    // Inject stealth scripts to hide automation
    await page.addInitScript(() => {
      // Override navigator.webdriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      // Override permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: any) => (
        parameters.name === 'notifications' 
          ? Promise.resolve({ state: Notification.permission } as any)
          : originalQuery(parameters)
      );
      
      // Hide playwright/playwright
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      
      // Override languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['ja-JP', 'ja', 'en-US', 'en'],
      });
    });
    
    // Test with one page
    const testUrl = 'https://weeklyandmonthly.com/tokyo/';
    console.log(`\nTesting: ${testUrl}`);
    
    await page.goto(testUrl, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    
    // Wait for content
    await page.waitForTimeout(3000);
    
    // Extract listings
    const pageListings = await page.evaluate(() => {
      const urls: any[] = [];
      const seen = new Set<string>();
      
      document.querySelectorAll('a[href*="/srch/?"][href*="id="]').forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        const fullUrl = href.startsWith('http') ? href : `https://weeklyandmonthly.com${href}`;
        if (seen.has(fullUrl)) return;
        seen.add(fullUrl);
        
        const card = link.closest('article, .room-item, .property-item, [class*="room"]') || link;
        
        const titleEl = card.querySelector('h3, .title, [class*="title"]');
        const title = titleEl?.textContent?.trim() || '';
        
        const priceEl = card.querySelector('.price, [class*="price"], .rent');
        const priceText = priceEl?.textContent?.trim() || '';
        const priceMatch = priceText.match(/([\d,]+)/);
        const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ''), 10) : 0;
        
        const locEl = card.querySelector('.location, [class*="location"], [class*="area"]');
        const location = locEl?.textContent?.trim() || '';
        
        const stationEl = card.querySelector('.station, [class*="station"], .access');
        const stationText = stationEl?.textContent?.trim() || '';
        const walkMatch = stationText.match(/徒歩\s*(\d+)\s*分/);
        const walkTime = walkMatch ? parseInt(walkMatch[1], 10) : 10;
        const stationMatch = stationText.match(/「(.+?)」/);
        const station = stationMatch ? stationMatch[1] : 'Tokyo Station';
        
        if (title && price > 30000) {
          urls.push({ url: fullUrl, title, price, location, station, walkTime });
        }
      });
      
      return urls;
    });
    
    console.log(`Found ${pageListings.length} listings on test page`);
    
    if (pageListings.length > 0) {
      console.log('✅ Playwright + Stealth is working!');
      console.log('Sample:', pageListings[0]);
    } else {
      console.log('❌ Still blocked - checking page content...');
      const title = await page.title();
      console.log('Page title:', title);
    }
    
    await browser.close();
    return [];
    
  } catch (error) {
    console.error('Playwright error:', error);
    if (browser) await browser.close();
    throw error;
  }
}

// Test if called directly
if (require.main === module) {
  fetchWithPlaywright().catch(console.error);
}
