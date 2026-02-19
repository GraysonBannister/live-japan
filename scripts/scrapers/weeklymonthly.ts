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
  tags?: string[];
  lat?: number;
  lng?: number;
}

// Station coordinates mapping for major Tokyo stations
const stationCoordinates: Record<string, { lat: number; lng: number }> = {
  '渋谷駅': { lat: 35.6585, lng: 139.7013 },
  '新宿駅': { lat: 35.6905, lng: 139.6995 },
  '池袋駅': { lat: 35.7295, lng: 139.7109 },
  '上野駅': { lat: 35.7148, lng: 139.7737 },
  '東京駅': { lat: 35.6812, lng: 139.7671 },
  '品川駅': { lat: 35.6285, lng: 139.7388 },
  '新橋駅': { lat: 35.6662, lng: 139.7582 },
  '銀座駅': { lat: 35.6710, lng: 139.7650 },
  '秋葉原駅': { lat: 35.6984, lng: 139.7731 },
  '原宿駅': { lat: 35.6702, lng: 139.7027 },
  '六本木駅': { lat: 35.6628, lng: 139.7314 },
  '表参道駅': { lat: 35.6652, lng: 139.7126 },
  '池尻大橋駅': { lat: 35.6505, lng: 139.6856 },
  '神泉駅': { lat: 35.6572, lng: 139.6934 },
  '牛込神楽坂駅': { lat: 35.7053, lng: 139.7366 },
  '勝どき駅': { lat: 35.6586, lng: 139.7766 },
  '芝公園駅': { lat: 35.6568, lng: 139.7498 },
  '麻布十番駅': { lat: 35.6564, lng: 139.7360 },
  '白金高輪駅': { lat: 35.6427, lng: 139.7345 },
  '市ヶ谷駅': { lat: 35.6911, lng: 139.7358 },
  '九段下駅': { lat: 35.6955, lng: 139.7516 },
  '飯田橋駅': { lat: 35.6958, lng: 139.7446 },
  '落合駅': { lat: 35.7105, lng: 139.6311 },
  '早稲田駅': { lat: 35.7060, lng: 139.7208 },
  '面影橋駅': { lat: 35.7279, lng: 139.7692 },
  '代々木駅': { lat: 35.6830, lng: 139.7020 },
  '参宮橋駅': { lat: 35.6779, lng: 139.7123 },
  '代々木参宮橋駅': { lat: 35.6779, lng: 139.7123 },
  '原町田駅': { lat: 35.5489, lng: 139.4454 },
  '若松河田駅': { lat: 35.6992, lng: 139.7178 },
  '東新宿駅': { lat: 35.7010, lng: 139.7070 },
  '蔵前駅': { lat: 35.7036, lng: 139.7906 },
  '浅草駅': { lat: 35.7148, lng: 139.7967 },
  '両国駅': { lat: 35.6970, lng: 139.7934 },
  '大塚駅': { lat: 35.7318, lng: 139.7282 },
  '高田馬場駅': { lat: 35.7123, lng: 139.7039 },
  '明大前駅': { lat: 35.6684, lng: 139.6507 },
};

// Ward/area coordinates for fallback
const areaCoordinates: Record<string, { lat: number; lng: number }> = {
  '渋谷区': { lat: 35.6595, lng: 139.7004 },
  '新宿区': { lat: 35.6938, lng: 139.7034 },
  '港区': { lat: 35.6582, lng: 139.7312 },
  '中央区': { lat: 35.6706, lng: 139.7720 },
  '品川区': { lat: 35.6093, lng: 139.7301 },
  '目黒区': { lat: 35.6415, lng: 139.6982 },
  '世田谷区': { lat: 35.6461, lng: 139.6530 },
  '千代田区': { lat: 35.6938, lng: 139.7535 },
  '台東区': { lat: 35.7123, lng: 139.7800 },
  '豊島区': { lat: 35.7263, lng: 139.7166 },
  '大田区': { lat: 35.5615, lng: 139.7160 },
  '中野区': { lat: 35.7075, lng: 139.6637 },
  '杉並区': { lat: 35.6996, lng: 139.6366 },
  '練馬区': { lat: 35.7356, lng: 139.6517 },
  '北区': { lat: 35.7528, lng: 139.7335 },
  '荒川区': { lat: 35.7361, lng: 139.7832 },
  '板橋区': { lat: 35.7508, lng: 139.7092 },
  '江戸川区': { lat: 35.7067, lng: 139.8682 },
  '葛飾区': { lat: 35.7439, lng: 139.8831 },
  '江東区': { lat: 35.6725, lng: 139.8160 },
  '墨田区': { lat: 35.7109, lng: 139.8016 },
  '文京区': { lat: 35.7089, lng: 139.7521 },
  '足立区': { lat: 35.7754, lng: 139.8042 },
  '立川市': { lat: 35.7156, lng: 139.4110 },
  '町田市': { lat: 35.5489, lng: 139.4454 },
};

function getCoordinatesFromStation(stationName: string): { lat: number; lng: number } | null {
  // Try exact match first
  if (stationCoordinates[stationName]) {
    return stationCoordinates[stationName];
  }
  
  // Try matching without "駅"
  const stationWithoutSuffix = stationName.replace('駅', '');
  if (stationCoordinates[stationWithoutSuffix + '駅']) {
    return stationCoordinates[stationWithoutSuffix + '駅'];
  }
  
  // Try partial match
  for (const [name, coords] of Object.entries(stationCoordinates)) {
    if (stationName.includes(name.replace('駅', ''))) {
      return coords;
    }
  }
  
  return null;
}

function getCoordinatesFromArea(areaName: string): { lat: number; lng: number } | null {
  for (const [area, coords] of Object.entries(areaCoordinates)) {
    if (areaName.includes(area)) {
      return coords;
    }
  }
  return null;
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
    
    // Step 1: Get all listing URLs from multiple pages
    const allListingUrls: Array<{ url: string; title: string; price: number; location: string; station: string; walkTime: number }> = [];
    const seenUrls = new Set<string>();
    
    // Define pages to scrape (Tokyo main + paginated pages)
    const pagesToScrape = [
      'https://weeklyandmonthly.com/tokyo/',
      'https://weeklyandmonthly.com/tokyo/?page=2',
      'https://weeklyandmonthly.com/tokyo/?page=3',
      'https://weeklyandmonthly.com/tokyo/?page=4',
      'https://weeklyandmonthly.com/tokyo/?page=5',
    ];
    
    for (const pageUrl of pagesToScrape) {
      try {
        console.log(`Fetching listing URLs from ${pageUrl}...`);
        await page.goto(pageUrl, {
          waitUntil: 'networkidle2',
          timeout: 30000,
        });
        await new Promise(r => setTimeout(r, 1500)); // Wait for content to load
        
        // Extract all listing URLs with basic info
        const pageListings = await page.evaluate(() => {
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
        
        // Add unique listings from this page
        for (const listing of pageListings) {
          if (!seenUrls.has(listing.url)) {
            seenUrls.add(listing.url);
            allListingUrls.push(listing);
          }
        }
        
        console.log(`  Found ${pageListings.length} listings on this page`);
        
      } catch (error) {
        console.log(`  Error scraping ${pageUrl}: ${error}`);
      }
    }
    
    const listingUrls = allListingUrls;
    
    console.log(`Found ${listingUrls.length} listing URLs`);
    
    // Step 2: Visit each detail page and extract full data
    const MAX_LISTINGS = 100; // Increased from 20 to 100
    for (let i = 0; i < Math.min(listingUrls.length, MAX_LISTINGS); i++) {
      const { url, title, price, location, station, walkTime } = listingUrls[i];
      
      try {
        console.log(`  [${i + 1}/${Math.min(listingUrls.length, MAX_LISTINGS)}] Scraping: ${title.substring(0, 50)}...`);
        
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
          
          // Get full address
          let fullAddress = '';
          let description = '';
          
          // Look for address in the page
          document.querySelectorAll('p, div, section').forEach((el) => {
            const text = el.textContent || '';
            // Match Japanese address pattern
            if (text.match(/(東京都|大阪府|京都府|北海道)[^\n]{5,50}/) && text.length < 200) {
              const match = text.match(/(東京都|大阪府|京都府|北海道)[^\n]{5,50}/);
              if (match && match[0].length > fullAddress.length) {
                fullAddress = match[0].trim();
              }
            }
          });
          
          // Get description from 物件概要 section - but skip structured fields
          const headings = document.querySelectorAll('h2, h3, h4, .section-title, .heading');
          headings.forEach((heading) => {
            if (heading.textContent?.includes('物件概要')) {
              const container = heading.closest('section, .section, .room-detail__section') || heading.parentElement;
              if (container) {
                // Get all paragraphs in the section, excluding those with structured data labels
                const paragraphs: string[] = [];
                container.querySelectorAll('p, dd, .text, [class*="text"]').forEach((el) => {
                  const text = el.textContent?.trim() || '';
                  // Skip if it's just a label or structured data we already capture
                  if (text.length < 10) return;
                  if (text.startsWith('所在地')) return;
                  if (text.startsWith('アクセス')) return;
                  if (text.startsWith('物件名')) return;
                  if (text.startsWith('賃料')) return;
                  if (text.startsWith('管理費')) return;
                  if (text.startsWith('間取り')) return;
                  if (text.startsWith('面積')) return;
                  if (text.startsWith('築年数')) return;
                  if (text.startsWith('階数')) return;
                  if (text.startsWith('向き')) return;
                  if (text.startsWith('構造')) return;
                  if (text.startsWith('住所')) return;
                  if (text.startsWith('最寄駅')) return;
                  if (text.startsWith('徒歩')) return;
                  if (text.match(/^(東京都|大阪府|京都府|北海道)/)) return; // Address lines
                  if (text.match(/^.+線.*「.+」.*徒歩/)) return; // Station access lines
                  
                  paragraphs.push(text);
                });
                
                if (paragraphs.length > 0) {
                  description = paragraphs.join('\n\n');
                }
              }
            }
          });
          
          // If no description found in 物件概要, try to find a comments/remarks section
          if (!description) {
            // Look for 備考 or コメント or 物件紹介 sections
            const commentHeadings = document.querySelectorAll('h2, h3, h4, .section-title');
            commentHeadings.forEach((h) => {
              const text = h.textContent || '';
              if (text.includes('備考') || text.includes('コメント') || text.includes('物件紹介') || text.includes('おすすめポイント')) {
                const container = h.closest('section, .section') || h.parentElement;
                if (container) {
                  const textContent = container.textContent?.replace(text, '').trim();
                  if (textContent && textContent.length > 20) {
                    description = textContent;
                  }
                }
              }
            });
          }
          
          // Remove duplicate content
          if (description) {
            const lines = description.split('\n');
            const uniqueLines: string[] = [];
            const seen = new Set<string>();
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed && !seen.has(trimmed)) {
                seen.add(trimmed);
                uniqueLines.push(trimmed);
              }
            }
            description = uniqueLines.join('\n');
          }
          
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
          
          // Get feature tags
          const tags: string[] = [];
          document.querySelectorAll('.accounticons__item, .tag, [class*="tag"], [class*="feature"]').forEach((el) => {
            const text = el.textContent?.trim();
            if (text && text.length < 50 && !text.includes('一覧')) {
              tags.push(text);
            }
          });
          
          // Also check for specific feature markers
          const featureSelectors = [
            '女性向け', 'インターネット無料', 'wifiあり', 'オートロック',
            '保証人不要', '風呂・トイレ別', '家具付賃貸', '禁煙ルーム',
            'カード決済OK', '法人契約歓迎', '出張・研修向け', 'テレワーク・在宅勤務可',
            'ペット可', '食事付', 'Wi-Fi無料'
          ];
          const pageText = document.body.textContent || '';
          featureSelectors.forEach(feature => {
            if (pageText.includes(feature) && !tags.includes(feature)) {
              tags.push(feature);
            }
          });
          
          return {
            photos: allPhotos,
            description,
            fullAddress,
            basePrice,
            pricingPlans,
            tags: [...new Set(tags)], // Remove duplicates
          };
        });
        
        // Get coordinates from station or area
        let lat: number | undefined;
        let lng: number | undefined;
        
        const stationCoords = getCoordinatesFromStation(station);
        if (stationCoords) {
          lat = stationCoords.lat;
          lng = stationCoords.lng;
        } else {
          const areaCoords = getCoordinatesFromArea(detailData.fullAddress || location || '');
          if (areaCoords) {
            lat = areaCoords.lat;
            lng = areaCoords.lng;
          }
        }
        
        // Add small random offset to prevent overlapping markers
        if (lat && lng) {
          lat += (Math.random() - 0.5) * 0.01;
          lng += (Math.random() - 0.5) * 0.01;
        }
        
        // Build listing with scraped data
        const fullAddress = detailData.fullAddress || location || '';
        
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
          descriptionEn: detailData.description && detailData.description.length > 20 ? detailData.description : title,
          descriptionJp: detailData.description && detailData.description.length > 20 ? detailData.description : title,
          location: fullAddress || location || 'Tokyo',
          lat,
          lng,
          pricingPlans: detailData.pricingPlans,
          tags: detailData.tags,
        };
        
        listings.push(listing);
        console.log(`      ✓ ${detailData.photos.length} photos, ${detailData.pricingPlans.length} pricing plans`);
        console.log(`      Description: ${detailData.description ? detailData.description.substring(0, 100) + '...' : '[EMPTY - using title]'}`);
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