import puppeteer from 'puppeteer';

async function diagnose() {
  console.log('Launching browser with stealth...');
  const browser = await puppeteer.launch({
    headless: false, // Try non-headless
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
  });
  
  const page = await browser.newPage();
  
  // Set more realistic viewport and user agent
  await page.setViewport({ width: 1366, height: 768 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  // Set extra headers
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  });
  
  console.log('Navigating to Tokyo page...');
  await page.goto('https://weeklyandmonthly.com/tokyo/', {
    waitUntil: 'domcontentloaded', // Try different wait
    timeout: 30000,
  });
  
  console.log('Waiting for content...');
  await new Promise(r => setTimeout(r, 5000));
  
  // Check if we got blocked
  const content = await page.content();
  const hasCloudflare = content.includes('cloudflare') || content.includes('cf-browser-verification');
  const hasCaptcha = content.includes('captcha') || content.includes('CAPTCHA');
  
  console.log('Page loaded. Checking content...');
  console.log('Has Cloudflare:', hasCloudflare);
  console.log('Has Captcha:', hasCaptcha);
  console.log('Page length:', content.length);
  console.log('First 500 chars:', content.substring(0, 500));
  
  const analysis = await page.evaluate(() => {
    return {
      title: document.title,
      totalLinks: document.querySelectorAll('a').length,
      srchLinks: document.querySelectorAll('a[href*="/srch/?"]').length,
    };
  });
  
  console.log('\nAnalysis:', analysis);
  
  await browser.close();
}

diagnose().catch(console.error);
