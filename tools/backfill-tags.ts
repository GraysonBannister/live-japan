import { prisma } from '../app/lib/prisma';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

// ScraperAPI configuration
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
const USE_SCRAPER_API = !!SCRAPER_API_KEY;

async function backfillTags() {
  console.log('Starting tag backfill process...\n');
  
  // Get all properties that don't have tags or have empty tags
  const properties = await prisma.property.findMany({
    where: {
      // Only process weeklyandmonthly.com listings
      sourceUrl: { contains: 'weeklyandmonthly.com' },
    },
  });
  
  // Filter to only those without tags
  const propertiesWithoutTags = properties.filter(p => {
    const tags = p.tags as string[] | null | undefined;
    return !tags || tags.length === 0;
  });
  
  console.log(`Found ${propertiesWithoutTags.length} properties to update with tags\n`);
  
  if (propertiesWithoutTags.length === 0) {
    console.log('No properties need tag updates.');
    return;
  }
  
  let browser: any = null;
  
  try {
    console.log('Launching browser...');
    
    const launchArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ];
    
    if (USE_SCRAPER_API) {
      launchArgs.push('--proxy-server=http://proxy-server.scraperapi.com:8001');
    }
    
    browser = await puppeteer.launch({
      headless: true,
      args: launchArgs,
    });
    
    const page = await browser.newPage();
    
    if (USE_SCRAPER_API) {
      await page.authenticate({
        username: 'scraperapi',
        password: SCRAPER_API_KEY,
      });
    }
    
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    let updated = 0;
    let failed = 0;
    
    for (let i = 0; i < propertiesWithoutTags.length; i++) {
      const property = propertiesWithoutTags[i];
      console.log(`[${i + 1}/${propertiesWithoutTags.length}] Processing: ${property.location.substring(0, 40)}...`);
      
      try {
        if (!property.sourceUrl) {
          console.log('  ✗ No source URL');
          failed++;
          continue;
        }
        
        // Visit the detail page
        await page.goto(property.sourceUrl, { 
          waitUntil: 'domcontentloaded', 
          timeout: 15000 
        });
        
        await new Promise(r => setTimeout(r, 1000));
        
        // Extract tags
        const tags = await page.evaluate(() => {
          const extractedTags: string[] = [];
          
          // Look for tags in various formats
          document.querySelectorAll('.tag, .badge, .label, [class*="tag"], [class*="feature"]').forEach((el) => {
            const tagText = el.textContent?.trim();
            if (tagText && tagText.length < 50 && !tagText.includes('¥') && !tagText.includes('http')) {
              extractedTags.push(tagText);
            }
          });
          
          // Check for common tags in page text
          const pageText = document.body.innerText || '';
          const commonTags = [
            '女性向け', '駅近', 'オートロック', '保証人不要', '風呂･トイレ別', '風呂・トイレ別',
            '家具付賃貸', '禁煙ルーム', 'デザイナーズ', '上階･眺望抜群', '上階・眺望抜群',
            '学生向け', '法人契約歓迎', '出張・研修向け', '日当り良好', '閑静な住宅地',
            '賃料交渉可', '空気清浄機付', '病院近く', '特急対応可', '即入居可', '礼金なし',
            '敷金なし', '新築', 'リノベーション', '宅配ボックス', 'エレベーター',
            'バス・トイレ別', '独立洗面台', '浴室乾燥機', '温水洗浄便座', '追い焚き',
            'システムキッチン', '角部屋', '南向き', 'バルコニー', 'ロフト付き', 'メゾネット',
            'WiFi無料', 'wifiあり', 'インターネット無料', 'ペット可', '食事付',
            'カード決済OK', 'テレワーク・在宅勤務可', '駐輪場あり', '駐車場あり'
          ];
          
          for (const tag of commonTags) {
            if (pageText.includes(tag) && !extractedTags.includes(tag)) {
              extractedTags.push(tag);
            }
          }
          
          // Check for furnished indicator
          if (pageText.includes('家具付') || pageText.includes('家具付き') || pageText.includes('ホーム電化製品')) {
            if (!extractedTags.includes('家具付賃貸') && !extractedTags.includes('家具付')) {
              extractedTags.push('家具付賃貸');
            }
          }
          
          // Check for foreigner friendly
          if (pageText.includes('外国人') || pageText.includes('Foreigner')) {
            if (!extractedTags.includes('外国人可')) {
              extractedTags.push('外国人可');
            }
          }
          
          return [...new Set(extractedTags)]; // Remove duplicates
        });
        
        if (tags.length > 0) {
          // Update the property with tags
          await prisma.property.update({
            where: { id: property.id },
            data: { tags },
          });
          console.log(`  ✓ Updated with ${tags.length} tags: ${tags.slice(0, 5).join(', ')}${tags.length > 5 ? '...' : ''}`);
          updated++;
        } else {
          console.log('  ⚠ No tags found');
          // Still mark as processed by setting empty array
          await prisma.property.update({
            where: { id: property.id },
            data: { tags: [] },
          });
        }
        
      } catch (error) {
        console.log(`  ✗ Error: ${(error as Error).message.substring(0, 50)}`);
        failed++;
      }
      
      // Small delay between requests
      await new Promise(r => setTimeout(r, 500));
    }
    
    console.log(`\n✓ Backfill complete!`);
    console.log(`  Updated: ${updated} properties`);
    console.log(`  Failed: ${failed} properties`);
    
  } catch (error) {
    console.error('Error during backfill:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

backfillTags();
