import puppeteer from 'puppeteer';

async function test() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
  
  // Test a detail page
  const testUrl = 'https://weeklyandmonthly.com/srch/?cm=v&id=676545';
  console.log('Testing:', testUrl);
  
  try {
    const response = await page.goto(testUrl, { waitUntil: 'networkidle2', timeout: 20000 });
    console.log('Status:', response?.status());
    console.log('URL:', page.url());
    
    // Check if we got redirected
    if (page.url() !== testUrl) {
      console.log('Redirected to:', page.url());
    }
    
    // Get page title
    const title = await page.title();
    console.log('Title:', title);
    
    // Try to find photos
    const photos = await page.evaluate(() => {
      const imgs: string[] = [];
      document.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src') || img.getAttribute('data-src');
        if (src && src.includes('.jpg')) imgs.push(src);
      });
      return imgs.slice(0, 5);
    });
    console.log('Found photos:', photos);
    
  } catch (e) {
    console.error('Error:', e);
  }
  
  await browser.close();
}

test();
