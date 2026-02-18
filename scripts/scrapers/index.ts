import { ListingSource } from '../ingest';
import * as cheerio from 'cheerio';
import { PuppeteerScraper } from './puppeteer';

/**
 * Base scraper interface for Japanese property sites
 */
export interface PropertyScraper {
  name: string;
  baseUrl: string;
  searchUrl: string;
  
  /** Fetch and parse listings from the site */
  fetchListings(): Promise<ListingSource[]>;
  
  /** Parse individual property details */
  parsePropertyDetail?(url: string): Promise<Partial<ListingSource>>;
}

/**
 * Rate limiter to avoid overwhelming sites
 */
class RateLimiter {
  private lastRequest = 0;
  private minDelay = 1000; // 1 second between requests

  async wait(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    if (timeSinceLastRequest < this.minDelay) {
      await new Promise(resolve => setTimeout(resolve, this.minDelay - timeSinceLastRequest));
    }
    this.lastRequest = Date.now();
  }
}

const rateLimiter = new RateLimiter();

/**
 * Fetch HTML with rate limiting and error handling
 */
async function fetchHtml(url: string): Promise<cheerio.CheerioAPI | null> {
  try {
    await rateLimiter.wait();
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8',
      },
    });
    
    if (!response.ok) {
      console.error(`HTTP error ${response.status} for ${url}`);
      return null;
    }
    
    const html = await response.text();
    return cheerio.load(html);
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    return null;
  }
}

/**
 * Extract price from Japanese text (e.g., "¥85,000/月" -> 85000)
 */
function extractPrice(text: string): number | null {
  const match = text.replace(/,/g, '').match(/[¥￥]?(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Extract walk time from text (e.g., "徒歩8分" -> 8)
 */
function extractWalkTime(text: string): number | null {
  const match = text.match(/徒歩\s*(\d+)\s*分/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Sumyca Scraper - Weekly/Monthly mansion aggregator
 * https://www.sumyca.com
 */
export class SumycaScraper implements PropertyScraper {
  name = 'Sumyca';
  baseUrl = 'https://www.sumyca.com';
  searchUrl = 'https://www.sumyca.com/en/search';

  async fetchListings(): Promise<ListingSource[]> {
    const listings: ListingSource[] = [];
    const $ = await fetchHtml(this.searchUrl);
    
    if (!$) return listings;

    // Sumyca uses a dynamic React app - we'd need to check their API endpoints
    // For now, this is a placeholder structure
    console.log('Sumyca requires API inspection or headless browser for dynamic content');
    
    return listings;
  }
}

/**
 * Sakura House Scraper
 * https://www.sakura-house.com
 */
export class SakuraHouseScraper implements PropertyScraper {
  name = 'Sakura House';
  baseUrl = 'https://www.sakura-house.com';
  searchUrl = 'https://www.sakura-house.com/search/';

  async fetchListings(): Promise<ListingSource[]> {
    const listings: ListingSource[] = [];
    
    // Sakura House has 91 buildings listed
    const $ = await fetchHtml('https://www.sakura-house.com/all/');
    if (!$) return listings;

    $('.property-item, .building-item, [class*="property"], [class*="building"]').each((i, el) => {
      const $el = $(el);
      
      const title = $el.find('h2, h3, .title, .name').first().text().trim();
      const priceText = $el.find('.price, [class*="price"]').first().text().trim();
      const location = $el.find('.location, .address, [class*="location"]').first().text().trim();
      const link = $el.find('a').first().attr('href');
      
      if (title && priceText) {
        const price = extractPrice(priceText);
        if (price) {
          listings.push({
            externalId: `sakura-${i}`,
            sourceUrl: link ? (link.startsWith('http') ? link : `${this.baseUrl}${link}`) : this.baseUrl,
            type: 'monthly_mansion',
            price,
            deposit: null,
            keyMoney: null,
            nearestStation: location || 'Tokyo',
            walkTime: 10, // Default
            furnished: true,
            foreignerFriendly: true,
            photos: [],
            descriptionEn: `${title} - Furnished share house/apartment`,
            descriptionJp: title,
            location: location || 'Tokyo',
          });
        }
      }
    });

    console.log(`Sakura House: Found ${listings.length} listings`);
    return listings;
  }
}

/**
 * Oakhouse Scraper
 * https://www.oakhouse.jp
 */
export class OakhouseScraper implements PropertyScraper {
  name = 'Oakhouse';
  baseUrl = 'https://www.oakhouse.jp';
  searchUrl = 'https://www.oakhouse.jp/eng/house/';

  async fetchListings(): Promise<ListingSource[]> {
    const listings: ListingSource[] = [];
    
    // Oakhouse has an English site
    const $ = await fetchHtml(this.searchUrl);
    if (!$) return listings;

    $('.house-item, .property-item, [class*="house"]').each((i, el) => {
      const $el = $(el);
      
      const title = $el.find('h2, h3, .title').first().text().trim();
      const priceText = $el.find('.price, .rent').first().text().trim();
      const stationText = $el.find('.station, .access').first().text().trim();
      const link = $el.find('a').first().attr('href');
      
      if (title && priceText) {
        const price = extractPrice(priceText);
        const walkTime = extractWalkTime(stationText) || 10;
        
        if (price) {
          listings.push({
            externalId: `oakhouse-${i}`,
            sourceUrl: link ? (link.startsWith('http') ? link : `${this.baseUrl}${link}`) : this.baseUrl,
            type: 'monthly_mansion',
            price,
            deposit: null,
            keyMoney: null,
            nearestStation: stationText.split(' ')[0] || 'Tokyo Station',
            walkTime,
            furnished: true,
            foreignerFriendly: true,
            photos: [],
            descriptionEn: `${title} - Social apartment with shared facilities`,
            location: 'Tokyo',
          });
        }
      }
    });

    console.log(`Oakhouse: Found ${listings.length} listings`);
    return listings;
  }
}

/**
 * GaijinPot Housing Scraper
 * https://housing.gaijinpot.com
 */
export class GaijinPotScraper implements PropertyScraper {
  name = 'GaijinPot Housing';
  baseUrl = 'https://housing.gaijinpot.com';
  searchUrl = 'https://housing.gaijinpot.com/rent/';

  async fetchListings(): Promise<ListingSource[]> {
    const listings: ListingSource[] = [];
    
    // Try to fetch multiple pages
    for (let page = 1; page <= 3; page++) {
      const url = `${this.searchUrl}?page=${page}`;
      const $ = await fetchHtml(url);
      if (!$) continue;

      $('.listing-item, .property-item, article').each((i, el) => {
        const $el = $(el);
        
        const title = $el.find('h2, h3, .title').first().text().trim();
        const priceText = $el.find('.price').first().text().trim();
        const location = $el.find('.location, .address').first().text().trim();
        const link = $el.find('a').first().attr('href');
        
        if (title && priceText) {
          const price = extractPrice(priceText);
          
          if (price && price > 30000) { // Filter out unrealistic prices
            listings.push({
              externalId: `gaijinpot-${page}-${i}`,
              sourceUrl: link ? (link.startsWith('http') ? link : `${this.baseUrl}${link}`) : this.baseUrl,
              type: 'apartment',
              price,
              deposit: null,
              keyMoney: null,
              nearestStation: location || 'Tokyo',
              walkTime: 10,
              furnished: false,
              foreignerFriendly: true,
              photos: [],
              descriptionEn: title,
              location: location || 'Tokyo',
            });
          }
        }
      });
    }

    console.log(`GaijinPot: Found ${listings.length} listings`);
    return listings;
  }
}

/**
 * Run all scrapers and aggregate results
 * Falls back to Puppeteer for JS-rendered sites
 */
export async function scrapeAll(): Promise<ListingSource[]> {
  const scrapers: PropertyScraper[] = [
    new SakuraHouseScraper(),
    new OakhouseScraper(),
    new GaijinPotScraper(),
  ];

  const allListings: ListingSource[] = [];

  // Try regular scraping first
  for (const scraper of scrapers) {
    console.log(`\n Scraping ${scraper.name}...`);
    try {
      const listings = await scraper.fetchListings();
      allListings.push(...listings);
      console.log(`✓ ${scraper.name}: ${listings.length} properties`);
    } catch (error) {
      console.error(`✗ ${scraper.name} failed:`, error);
    }
  }

  // If regular scraping returned few results, try Puppeteer
  if (allListings.length < 5) {
    console.log('\n⚠ Regular scraping found few results. Trying headless browser...\n');
    const puppeteerScraper = new PuppeteerScraper();
    const puppeteerListings = await puppeteerScraper.scrapeAll();
    allListings.push(...puppeteerListings);
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

// Export for use in ingest script
export { extractPrice, extractWalkTime };