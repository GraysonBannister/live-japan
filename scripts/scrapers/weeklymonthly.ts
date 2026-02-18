import { ListingSource } from '../ingest';

/**
 * Puppeteer scraper for weeklyandmonthly.com
 * Scrapes detail pages to get ALL photos, full descriptions, and correct pricing
 */
export async function fetchRealListings(): Promise<ListingSource[]> {
  const listings: ListingSource[] = [];
  let browser: any = null;
  
  // Dynamic import puppeteer
  const puppeteer = await import('puppeteer');
  
  try {
    console.log('Launching headless browser...');
    browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    // Step 1: Get all listing URLs from the Tokyo page
    console.log('Fetching listing URLs from weeklyandmonthly.com/tokyo/...');
    await page.goto('https://weeklyandmonthly.com/tokyo/', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    
    // Extract all listing URLs with basic info
    const listingUrls = await page.evaluate(() => {
      const urls: Array<{ url: string; title: string; price: number; location: string; station: string; walkTime: number }> = [];
      const seen = new Set<string>();
      
      // Find all property cards/links
      document.querySelectorAll('a[href*="/srch/?"][href*="id="]').forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        const fullUrl = href.startsWith('http') ? href : `https://weeklyandmonthly.com${href}`;
        if (seen.has(fullUrl)) return;
        seen.add(fullUrl);
        
        // Get the card container
        const card = link.closest('article, .room-item, .property-item, [class*="room"]') || link;
        
        // Get title
        const titleEl = card.querySelector('h3, .title, [class*="title"]');
        const title = titleEl?.textContent?.trim() || link.textContent?.trim() || '';
        
        // Get price
        const priceEl = card.querySelector('.price, [class*="price"], .rent');
        const priceText = priceEl?.textContent?.trim() || '';
        const priceMatch = priceText.match(/([\d,]+)/);
        const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ''), 10) : 0;
        
        // Get location
        const locEl = card.querySelector('.location, [class*="location"], [class*="area"]');
        const location = locEl?.textContent?.trim() || '';
        
        // Get station info
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
    
    console.log(`Found ${listingUrls.length} listing URLs`);
    
    // Step 2: Visit each detail page and extract full data
    for (let i = 0; i < Math.min(listingUrls.length, 25); i++) {
      const { url, title, price, location, station, walkTime } = listingUrls[i];
      
      try {
        console.log(`  [${i + 1}/${Math.min(listingUrls.length, 25)}] Scraping: ${title.substring(0, 50)}...`);
        
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
        await new Promise(r => setTimeout(r, 2000));
        
        // Extract ALL data from detail page
        const detailData = await page.evaluate(() => {
          // Get ALL photos from the gallery - looking for modaal gallery
          const allPhotos: string[] = [];
          
          document.querySelectorAll('.modaal__gallery-img img, .gallery img, .photo img, [class*="gallery"] img').forEach((img) => {
            const src = img.getAttribute('src') || img.getAttribute('data-src');
            if (src && src.length > 10 && (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.webp'))) {
              // Use the full quality URL
              const fullSrc = src.startsWith('http') ? src : `https://weeklyandmonthly.com${src}`;
              if (!allPhotos.includes(fullSrc)) {
                allPhotos.push(fullSrc);
              }
            }
          });
          
          // Get description from 物件概要 section
          let description = '';
          
          // Try to find 物件概要 section
          const headings = document.querySelectorAll('h2, h3, h4, .section-title');
          headings.forEach((heading) => {
            if (heading.textContent?.includes('物件概要')) {
              // Get the next sibling or parent container text
              const container = heading.closest('section, .section, div') || heading.parentElement;
              if (container) {
                // Get text from the container but exclude the heading itself
                const text = container.textContent?.replace(heading.textContent, '').trim();
                if (text && text.length > 10) {
                  description = text.substring(0, 800);
                }
              }
            }
          });
          
          // If no description found, try to get from room details
          if (!description) {
            const detailSection = document.querySelector('.room-detail, .property-detail, [class*="detail"]');
            if (detailSection) {
              description = detailSection.textContent?.trim().substring(0, 800) || '';
            }
          }
          
          // Get pricing - look for the main monthly rent
          let monthlyPrice = 0;
          let planName = '';
          
          // Look for price table or sections
          document.querySelectorAll('.price, [class*="price"], .rent, .plan').forEach((el) => {
            const text = el.textContent || '';
            
            // Look for 月額 (monthly amount) specifically
            if (text.includes('月額') || text.includes('賃料')) {
              const match = text.match(/月額.*?([\d,]+)\s*円/);
              if (match) {
                const p = parseInt(match[1].replace(/,/g, ''), 10);
                if (p > monthlyPrice && p > 30000) {
                  monthlyPrice = p;
                }
              }
            }
            
            // Also check for plan names
            if (text.includes('ロング') || text.includes('1ヶ月') || text.includes('ウィークリー')) {
              planName = text.substring(0, 50);
            }
          });
          
          // Get room features
          const features: string[] = [];
          document.querySelectorAll('.feature, .amenity, .tag, [class*="feature"]').forEach((el) => {
            const text = el.textContent?.trim();
            if (text && text.length < 50) features.push(text);
          });
          
          return {
            photos: allPhotos,
            description,
            monthlyPrice,
            planName,
            features,
          };
        });
        
        // Build listing
        const listing: ListingSource = {
          externalId: `wm-${url.match(/id=(\d+)/)?.[1] || i}`,
          sourceUrl: url,
          type: 'monthly_mansion',
          price: detailData.monthlyPrice > 30000 ? detailData.monthlyPrice : price,
          deposit: null,
          keyMoney: null,
          nearestStation: station,
          walkTime,
          furnished: true,
          foreignerFriendly: true,
          photos: detailData.photos,
          descriptionEn: detailData.description || title,
          descriptionJp: detailData.description || title,
          location: location || 'Tokyo',
        };
        
        listings.push(listing);
        console.log(`      ✓ ${detailData.photos.length} photos, ${listing.price.toLocaleString()}¥/month`);
        if (detailData.description) {
          console.log(`      ✓ Description: ${detailData.description.substring(0, 60)}...`);
        }
        
      } catch (error) {
        console.log(`      ✗ Failed: ${error}`);
      }
    }
    
  } catch (error) {
    console.error('Error with Puppeteer scraper:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  console.log(`\n✓ Total listings scraped: ${listings.length}`);
  return listings;
}