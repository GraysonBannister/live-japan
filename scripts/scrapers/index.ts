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
  private minDelay = 1500; // 1.5 seconds between requests

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
        'Referer': 'https://www.google.com/',
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
  // Match various price formats: ¥85,000, 85,000 yen, 85000/month, etc.
  const match = text.replace(/,/g, '').match(/[¥￥]?\s*(\d{4,6})\s*/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Extract walk time from text (e.g., "徒歩8分" -> 8)
 */
function extractWalkTime(text: string): number | null {
  // Match Japanese and English formats
  const jpMatch = text.match(/徒歩\s*(\d+)\s*分/);
  if (jpMatch) return parseInt(jpMatch[1], 10);
  
  const enMatch = text.match(/(\d+)\s*min/i);
  if (enMatch) return parseInt(enMatch[1], 10);
  
  return null;
}

/**
 * Extract station name from access text
 */
function extractStation(text: string): string {
  // Try to extract station name from patterns like "Shinjuku Station 8 min" or "新宿駅 徒歩8分"
  const enMatch = text.match(/^([^,\d]+?)(?:\s+Station|\s+\d+|$)/i);
  if (enMatch) return enMatch[1].trim();
  
  const jpMatch = text.match(/^([^,\d徒歩分]+?)(?:駅|$)/);
  if (jpMatch) return jpMatch[1].trim() + ' Station';
  
  return text.split(/[\d,]/)[0].trim() || 'Tokyo';
}

/**
 * Real Estate Japan Scraper
 * https://realestate-japan.com - Foreigner-friendly rental listings
 */
export class RealEstateJapanScraper implements PropertyScraper {
  name = 'Real Estate Japan';
  baseUrl = 'https://realestate-japan.com';
  searchUrl = 'https://realestate-japan.com/property-list/';

  async fetchListings(): Promise<ListingSource[]> {
    const listings: ListingSource[] = [];
    
    // Try multiple pages
    for (let page = 1; page <= 5; page++) {
      const url = page === 1 ? this.searchUrl : `${this.searchUrl}page/${page}/`;
      const $ = await fetchHtml(url);
      if (!$) continue;

      $('.property-item, .listing-item, article.property, .property-card').each((i, el) => {
        const $el = $(el);
        
        const title = $el.find('h2, h3, .property-title, .title').first().text().trim();
        const priceText = $el.find('.price, .property-price, .rent').first().text().trim();
        const location = $el.find('.location, .address, .area').first().text().trim();
        const access = $el.find('.access, .station, .transport').first().text().trim();
        const link = $el.find('a').first().attr('href');
        const imgSrc = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src');
        
        if (title && priceText) {
          const price = extractPrice(priceText);
          const walkTime = extractWalkTime(access);
          const station = extractStation(access);
          
          if (price && price > 30000 && price < 500000) {
            listings.push({
              externalId: `rejp-${page}-${i}`,
              sourceUrl: link ? (link.startsWith('http') ? link : `${this.baseUrl}${link}`) : this.baseUrl,
              type: 'apartment',
              price,
              deposit: null,
              keyMoney: null,
              nearestStation: station,
              walkTime: walkTime || 10,
              furnished: title.toLowerCase().includes('furnished') || descriptionEn?.toLowerCase().includes('furnished'),
              foreignerFriendly: true,
              photos: imgSrc ? [imgSrc.startsWith('http') ? imgSrc : `${this.baseUrl}${imgSrc}`] : [],
              descriptionEn: title,
              location: location || 'Tokyo',
            });
          }
        }
      });

      // Check if there's a next page
      const hasNext = $('.pagination .next, .pagination a[rel="next"]').length > 0;
      if (!hasNext) break;
    }

    console.log(`${this.name}: Found ${listings.length} listings`);
    return listings;
  }
}

/**
 * GaijinPot Real Estate Scraper
 * https://realestate.gaijinpot.com - FIXED URL
 */
export class GaijinPotScraper implements PropertyScraper {
  name = 'GaijinPot Real Estate';
  baseUrl = 'https://realestate.gaijinpot.com';
  searchUrl = 'https://realestate.gaijinpot.com/rent/';

  async fetchListings(): Promise<ListingSource[]> {
    const listings: ListingSource[] = [];
    
    // Try to fetch multiple pages
    for (let page = 1; page <= 3; page++) {
      const url = `${this.searchUrl}?page=${page}`;
      const $ = await fetchHtml(url);
      if (!$) continue;

      $('.listing-item, .property-item, article, .property-card, .search-result-item').each((i, el) => {
        const $el = $(el);
        
        const title = $el.find('h2, h3, .title, .property-title').first().text().trim();
        const priceText = $el.find('.price, .property-price').first().text().trim();
        const location = $el.find('.location, .address, .area').first().text().trim();
        const access = $el.find('.access, .station, .transport').first().text().trim();
        const link = $el.find('a').first().attr('href');
        
        if (title && priceText) {
          const price = extractPrice(priceText);
          const walkTime = extractWalkTime(access);
          const station = extractStation(access);
          
          if (price && price > 30000 && price < 500000) {
            listings.push({
              externalId: `gp-${page}-${i}`,
              sourceUrl: link ? (link.startsWith('http') ? link : `${this.baseUrl}${link}`) : this.baseUrl,
              type: 'apartment',
              price,
              deposit: null,
              keyMoney: null,
              nearestStation: station,
              walkTime: walkTime || 10,
              furnished: title.toLowerCase().includes('furnished'),
              foreignerFriendly: true,
              photos: [],
              descriptionEn: title,
              location: location || 'Tokyo',
            });
          }
        }
      });
    }

    console.log(`${this.name}: Found ${listings.length} listings`);
    return listings;
  }
}

/**
 * Village House Scraper
 * https://www.village-house.jp - Budget apartments, foreigner-friendly
 */
export class VillageHouseScraper implements PropertyScraper {
  name = 'Village House';
  baseUrl = 'https://www.village-house.jp';
  searchUrl = 'https://www.village-house.jp/en/';

  async fetchListings(): Promise<ListingSource[]> {
    const listings: ListingSource[] = [];
    
    const $ = await fetchHtml(this.searchUrl);
    if (!$) return listings;

    // Village House has property listings on their main page and area pages
    $('.property-item, .room-item, [class*="property"], [class*="room"]').each((i, el) => {
      const $el = $(el);
      
      const title = $el.find('h2, h3, .title, .property-name').first().text().trim();
      const priceText = $el.find('.price, .rent, [class*="price"]').first().text().trim();
      const location = $el.find('.location, .address, .area').first().text().trim();
      const link = $el.find('a').first().attr('href');
      
      if (title && priceText) {
        const price = extractPrice(priceText);
        
        if (price && price > 20000 && price < 300000) {
          listings.push({
            externalId: `vh-${i}`,
            sourceUrl: link ? (link.startsWith('http') ? link : `${this.baseUrl}${link}`) : this.baseUrl,
            type: 'apartment',
            price,
            deposit: 0, // Village House often has no deposit/key money
            keyMoney: 0,
            nearestStation: location || 'Tokyo',
            walkTime: 10,
            furnished: false,
            foreignerFriendly: true,
            photos: [],
            descriptionEn: `${title} - Budget-friendly apartment with no key money`,
            location: location || 'Tokyo',
          });
        }
      }
    });

    console.log(`${this.name}: Found ${listings.length} listings`);
    return listings;
  }
}

/**
 * Fontana Heights Scraper (Tokyo Apartments)
 * https://www.fontana-heights.com - Foreigner-friendly rentals
 */
export class FontanaHeightsScraper implements PropertyScraper {
  name = 'Fontana Heights';
  baseUrl = 'https://www.fontana-heights.com';
  searchUrl = 'https://www.fontana-heights.com/properties/';

  async fetchListings(): Promise<ListingSource[]> {
    const listings: ListingSource[] = [];
    
    const $ = await fetchHtml(this.searchUrl);
    if (!$) return listings;

    $('.property, .listing, article').each((i, el) => {
      const $el = $(el);
      
      const title = $el.find('h2, h3, .title').first().text().trim();
      const priceText = $el.find('.price, .rent').first().text().trim();
      const location = $el.find('.location, .address').first().text().trim();
      const link = $el.find('a').first().attr('href');
      
      if (title && priceText) {
        const price = extractPrice(priceText);
        
        if (price && price > 30000) {
          listings.push({
            externalId: `fh-${i}`,
            sourceUrl: link ? (link.startsWith('http') ? link : `${this.baseUrl}${link}`) : this.baseUrl,
            type: 'apartment',
            price,
            deposit: null,
            keyMoney: null,
            nearestStation: location || 'Tokyo',
            walkTime: 10,
            furnished: title.toLowerCase().includes('furnished'),
            foreignerFriendly: true,
            photos: [],
            descriptionEn: title,
            location: location || 'Tokyo',
          });
        }
      }
    });

    console.log(`${this.name}: Found ${listings.length} listings`);
    return listings;
  }
}

/**
 * Leopalace21 Scraper
 * https://www.leopalace21.com - Major monthly mansion provider
 */
export class LeopalaceScraper implements PropertyScraper {
  name = 'Leopalace21';
  baseUrl = 'https://www.leopalace21.com';
  searchUrl = 'https://www.leopalace21.com/english/';

  async fetchListings(): Promise<ListingSource[]> {
    const listings: ListingSource[] = [];
    
    const $ = await fetchHtml(this.searchUrl);
    if (!$) return listings;

    $('.property-item, .room-item, [class*="property"]').each((i, el) => {
      const $el = $(el);
      
      const title = $el.find('h2, h3, .title').first().text().trim();
      const priceText = $el.find('.price, .rent').first().text().trim();
      const location = $el.find('.location, .address').first().text().trim();
      const link = $el.find('a').first().attr('href');
      
      if (title && priceText) {
        const price = extractPrice(priceText);
        
        if (price && price > 30000) {
          listings.push({
            externalId: `leo-${i}`,
            sourceUrl: link ? (link.startsWith('http') ? link : `${this.baseUrl}${link}`) : this.baseUrl,
            type: 'monthly_mansion',
            price,
            deposit: null,
            keyMoney: null,
            nearestStation: location || 'Tokyo',
            walkTime: 10,
            furnished: true, // Leopalace properties are furnished
            foreignerFriendly: true,
            photos: [],
            descriptionEn: `${title} - Furnished monthly mansion`,
            location: location || 'Tokyo',
          });
        }
      }
    });

    console.log(`${this.name}: Found ${listings.length} listings`);
    return listings;
  }
}

/**
 * Daito Trust (Rent) Scraper
 * https://rent.daito-trust.co.jp - Major rental company
 */
export class DaitoTrustScraper implements PropertyScraper {
  name = 'Daito Trust';
  baseUrl = 'https://rent.daito-trust.co.jp';
  searchUrl = 'https://rent.daito-trust.co.jp/en/';

  async fetchListings(): Promise<ListingSource[]> {
    const listings: ListingSource[] = [];
    
    const $ = await fetchHtml(this.searchUrl);
    if (!$) return listings;

    $('.property-item, .room-item, [class*="property"]').each((i, el) => {
      const $el = $(el);
      
      const title = $el.find('h2, h3, .title').first().text().trim();
      const priceText = $el.find('.price, .rent').first().text().trim();
      const location = $el.find('.location, .address').first().text().trim();
      const link = $el.find('a').first().attr('href');
      
      if (title && priceText) {
        const price = extractPrice(priceText);
        
        if (price && price > 30000) {
          listings.push({
            externalId: `daito-${i}`,
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

    console.log(`${this.name}: Found ${listings.length} listings`);
    return listings;
  }
}

/**
 * Run all scrapers and aggregate results
 */
export async function scrapeAll(): Promise<ListingSource[]> {
  const scrapers: PropertyScraper[] = [
    new RealEstateJapanScraper(),
    new GaijinPotScraper(),
    new VillageHouseScraper(),
    new FontanaHeightsScraper(),
    new LeopalaceScraper(),
    new DaitoTrustScraper(),
  ];

  const allListings: ListingSource[] = [];

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

  // If regular scraping returned few results, try Puppeteer for JS-rendered sites
  if (allListings.length < 10) {
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
