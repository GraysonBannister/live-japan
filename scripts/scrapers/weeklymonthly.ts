import { ListingSource } from '../ingest';

interface PricingPlan {
  name: string;
  duration: string;
  monthlyPrice: number;
  initialCost: number;
  features: string[];
}

interface DetailedListing extends ListingSource {
  pricingPlans?: PricingPlan[];
}

/**
 * Puppeteer scraper for weeklyandmonthly.com
 * Scrapes detail pages to get ALL photos, full descriptions, and ALL pricing plans
 */
export async function fetchRealListings(): Promise<DetailedListing[]> {
  const listings: DetailedListing[] = [];
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
      
      document.querySelectorAll('a[href*="/srch/?"][href*="id="]').forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        const fullUrl = href.startsWith('http') ? href : `https://weeklyandmonthly.com${href}`;
        if (seen.has(fullUrl)) return;
        seen.add(fullUrl);
        
        const card = link.closest('article, .room-item, .property-item, [class*="room"]') || link;
        
        const titleEl = card.querySelector('h3, .title, [class*="title"]');
        const title = titleEl?.textContent?.trim() || link.textContent?.trim() || '';
        
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
    
    console.log(`Found ${listingUrls.length} listing URLs`);
    
    // Step 2: Visit each detail page and extract full data
    for (let i = 0; i < Math.min(listingUrls.length, 20); i++) {
      const { url, title, price, location, station, walkTime } = listingUrls[i];
      
      try {
        console.log(`  [${i + 1}/${Math.min(listingUrls.length, 20)}] Scraping: ${title.substring(0, 50)}...`);
        
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
        await new Promise(r => setTimeout(r, 2000));
        
        // Extract ALL data from detail page
        const detailData = await page.evaluate(() => {
          // Get ALL photos
          const allPhotos: string[] = [];
          document.querySelectorAll('.modaal__gallery-img img, .gallery img, .photo img').forEach((img) => {
            const src = img.getAttribute('src') || img.getAttribute('data-src');
            if (src && src.length > 10 && (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.webp'))) {
              const fullSrc = src.startsWith('http') ? src : `https://weeklyandmonthly.com${src}`;
              if (!allPhotos.includes(fullSrc)) {
                allPhotos.push(fullSrc);
              }
            }
          });
          
          // Get description
          let description = '';
          const headings = document.querySelectorAll('h2, h3, h4, .section-title');
          headings.forEach((heading) => {
            if (heading.textContent?.includes('物件概要')) {
              const container = heading.closest('section, .section, div') || heading.parentElement;
              if (container) {
                const text = container.textContent?.replace(heading.textContent, '').trim();
                if (text && text.length > 10) {
                  description = text.substring(0, 1000);
                }
              }
            }
          });
          
          // Get ALL pricing plans
          const pricingPlans: PricingPlan[] = [];
          
          // Look for plan list
          document.querySelectorAll('.plan-list__item, [class*="plan-item"]').forEach((planEl) => {
            const nameEl = planEl.querySelector('.plan-list__item-title, [class*="plan-title"], h3');
            const name = nameEl?.textContent?.trim() || '';
            
            // Get duration
            const durationMatch = name.match(/(\d+日.*?～.*?\d+日未満)|(\d+日以上)|(\d+ヶ月)/);
            const duration = durationMatch ? durationMatch[0] : '';
            
            // Get monthly price
            const monthlyEl = planEl.querySelector('.plan-list__outline-price.em, [class*="monthly"]');
            const monthlyText = monthlyEl?.textContent || '';
            const monthlyMatch = monthlyText.match(/([\d,]+)/);
            const monthlyPrice = monthlyMatch ? parseInt(monthlyMatch[1].replace(/,/g, ''), 10) : 0;
            
            // Get initial cost
            const initialEl = planEl.querySelectorAll('.plan-list__outline-price')[1];
            const initialText = initialEl?.textContent || '';
            const initialMatch = initialText.match(/([\d,]+)/);
            const initialCost = initialMatch ? parseInt(initialMatch[1].replace(/,/g, ''), 10) : 0;
            
            if (name && monthlyPrice > 0) {
              pricingPlans.push({
                name: name.replace(duration, '').trim(),
                duration,
                monthlyPrice,
                initialCost,
                features: [],
              });
            }
          });
          
          // Get base price (lowest plan)
          let basePrice = 0;
          if (pricingPlans.length > 0) {
            basePrice = Math.min(...pricingPlans.map(p => p.monthlyPrice));
          }
          
          return {
            photos: allPhotos,
            description,
            basePrice,
            pricingPlans,
          };
        });
        
        // Build listing with scraped data
        const listing: DetailedListing = {
          externalId: `wm-${url.match(/id=(\d+)/)?.[1] || i}`,
          sourceUrl: url,
          type: 'monthly_mansion',
          price: detailData.basePrice > 30000 ? detailData.basePrice : price,
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
          pricingPlans: detailData.pricingPlans,
        };
        
        listings.push(listing);
        console.log(`      ✓ ${detailData.photos.length} photos, ${detailData.pricingPlans.length} pricing plans`);
        detailData.pricingPlans.forEach((plan: PricingPlan) => {
          console.log(`        - ${plan.name}: ¥${plan.monthlyPrice.toLocaleString()}/month (${plan.duration})`);
        });
        
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