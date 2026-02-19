import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

async function diagnosePhotos() {
  console.log('Diagnosing photo extraction...');
  console.log('ScraperAPI:', SCRAPER_API_KEY ? '✓ configured' : '✗ not configured');
  
  const launchArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
  ];
  
  if (SCRAPER_API_KEY) {
    launchArgs.push('--proxy-server=http://proxy-server.scraperapi.com:8001');
  }
  
  const browser = await puppeteer.launch({
    headless: true,
    args: launchArgs,
  });
  
  const page = await browser.newPage();
  
  if (SCRAPER_API_KEY) {
    await page.authenticate({
      username: 'scraperapi',
      password: SCRAPER_API_KEY,
    });
  }
  
  // Test with a known listing URL
  const testUrl = 'https://weeklyandmonthly.com/srch/?cm=v&id=888649';
  console.log(`\nNavigating to: ${testUrl}`);
  
  await page.goto(testUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  
  // Analyze image elements
  const analysis = await page.evaluate(() => {
    const results: any = {
      totalImages: document.querySelectorAll('img').length,
      imagesWithSrc: [],
      galleryImages: [],
      modaalImages: [],
    };
    
    // All images
    document.querySelectorAll('img').forEach((img, i) => {
      const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
      if (src && (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.webp') || src.includes('.png'))) {
        results.imagesWithSrc.push({
          index: i,
          src: src.substring(0, 100),
          className: img.className,
          parentClass: img.parentElement?.className || '',
        });
      }
    });
    
    // Check for specific gallery containers
    document.querySelectorAll('.modaal__gallery-img img, .gallery img, .photo img, .room-photo img, [class*="gallery"] img, [class*="photo"] img').forEach((img) => {
      const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
      if (src) {
        results.galleryImages.push(src.substring(0, 100));
      }
    });
    
    // Check for modaal specifically
    document.querySelectorAll('.modaal__gallery-img').forEach((el) => {
      results.modaalImages.push({
        tagName: el.tagName,
        className: el.className,
        html: el.outerHTML.substring(0, 200),
      });
    });
    
    // Look for image containers
    results.possibleContainers = [];
    ['.gallery', '.photos', '.images', '.room-gallery', '.property-gallery', '[class*="gallery"]', '[class*="photo"]', '.modaal'].forEach(selector => {
      const els = document.querySelectorAll(selector);
      if (els.length > 0) {
        results.possibleContainers.push({
          selector,
          count: els.length,
          sampleHTML: els[0]?.outerHTML?.substring(0, 300) || '',
        });
      }
    });
    
    return results;
  });
  
  console.log('\n=== IMAGE ANALYSIS ===');
  console.log('Total images on page:', analysis.totalImages);
  console.log('\nImages with src (first 10):');
  analysis.imagesWithSrc.slice(0, 10).forEach((img: any) => {
    console.log(`  [${img.index}] ${img.src.substring(0, 60)}...`);
    console.log(`      class: ${img.className || '(none)'}`);
    console.log(`      parent: ${img.parentClass?.substring(0, 50) || '(none)'}`);
  });
  
  console.log('\nGallery images found:', analysis.galleryImages.length);
  analysis.galleryImages.slice(0, 5).forEach((src: string) => {
    console.log(`  - ${src.substring(0, 80)}...`);
  });
  
  console.log('\nModaal containers found:', analysis.modaalImages.length);
  
  console.log('\nPossible photo containers:');
  analysis.possibleContainers.forEach((c: any) => {
    console.log(`\n  ${c.selector} (${c.count} found)`);
    console.log(`  Sample: ${c.sampleHTML.substring(0, 200)}...`);
  });
  
  await browser.close();
}

diagnosePhotos().catch(console.error);
