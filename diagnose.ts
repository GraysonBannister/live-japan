import puppeteer from 'puppeteer';

async function diagnose() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
  
  console.log('Navigating to Tokyo page...');
  await page.goto('https://weeklyandmonthly.com/tokyo/', {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });
  
  console.log('Waiting for content...');
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('Analyzing page structure...\n');
  
  const analysis = await page.evaluate(() => {
    const results: any = {
      totalLinks: document.querySelectorAll('a').length,
      srchLinks: document.querySelectorAll('a[href*="/srch/?"]').length,
      srchWithId: document.querySelectorAll('a[href*="/srch/?"][href*="id="]').length,
      sampleHrefs: [] as string[],
      articles: document.querySelectorAll('article').length,
      roomItems: document.querySelectorAll('.room-item, [class*="room"]').length,
    };
    
    // Get sample hrefs
    document.querySelectorAll('a[href*="/srch/?"]').forEach((a, i) => {
      if (i < 5) results.sampleHrefs.push(a.getAttribute('href'));
    });
    
    // Check for listings container
    const container = document.querySelector('.room-list, .property-list, [class*="list"]');
    results.hasListContainer = !!container;
    results.containerClass = container?.className || 'none';
    
    return results;
  });
  
  console.log('Analysis results:');
  console.log(JSON.stringify(analysis, null, 2));
  
  await browser.close();
  console.log('\nDone!');
}

diagnose().catch(console.error);
