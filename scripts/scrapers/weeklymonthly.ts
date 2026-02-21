import { ListingSource } from '../ingest';

// Use puppeteer-extra with stealth plugin to bypass bot detection
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

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

// Station coordinates mapping for major stations across Japan
const stationCoordinates: Record<string, { lat: number; lng: number }> = {
  // ===== TOKYO (Japanese) =====
  '渋谷駅': { lat: 35.6585, lng: 139.7013 },
  '新宿駅': { lat: 35.6905, lng: 139.6995 },
  '池袋駅': { lat: 35.7295, lng: 139.7109 },
  '上野駅': { lat: 35.7148, lng: 139.7737 },
  '東京駅': { lat: 35.6812, lng: 139.7671 },

  // ===== TOKYO (English - for scraper compatibility) =====
  'Tokyo Station': { lat: 35.6812, lng: 139.7671 },
  'Shibuya Station': { lat: 35.6585, lng: 139.7013 },
  'Shinjuku Station': { lat: 35.6905, lng: 139.6995 },
  'Ikebukuro Station': { lat: 35.7295, lng: 139.7109 },
  'Ueno Station': { lat: 35.7148, lng: 139.7737 },
  'Shinagawa Station': { lat: 35.6285, lng: 139.7388 },
  'Shimbashi Station': { lat: 35.6662, lng: 139.7582 },
  'Ginza Station': { lat: 35.6710, lng: 139.7650 },
  'Akihabara Station': { lat: 35.6984, lng: 139.7731 },
  'Harajuku Station': { lat: 35.6702, lng: 139.7027 },
  'Roppongi Station': { lat: 35.6628, lng: 139.7314 },
  'Omotesando Station': { lat: 35.6652, lng: 139.7126 },
  'Ikejiri-Ohashi Station': { lat: 35.6505, lng: 139.6856 },
  'Shinsen Station': { lat: 35.6572, lng: 139.6934 },
  'Ushigome-Kagurazaka Station': { lat: 35.7053, lng: 139.7366 },
  'Kachidoki Station': { lat: 35.6586, lng: 139.7766 },
  'Shiba-Koen Station': { lat: 35.6568, lng: 139.7498 },
  'Azabu-Juban Station': { lat: 35.6564, lng: 139.7360 },
  'Shirokane-Takanawa Station': { lat: 35.6427, lng: 139.7345 },
  'Ichigaya Station': { lat: 35.6911, lng: 139.7358 },
  'Kudanshita Station': { lat: 35.6955, lng: 139.7516 },
  'Iidabashi Station': { lat: 35.6958, lng: 139.7446 },
  'Ochiai Station': { lat: 35.7105, lng: 139.6311 },
  'Waseda Station': { lat: 35.7060, lng: 139.7208 },
  'Omokagebashi Station': { lat: 35.7279, lng: 139.7692 },
  'Yoyogi Station': { lat: 35.6830, lng: 139.7020 },
  'Sangubashi Station': { lat: 35.6779, lng: 139.7123 },
  'Yoyogi-Sangenjaya Station': { lat: 35.6779, lng: 139.7123 },
  'Machida Station': { lat: 35.5489, lng: 139.4454 },
  'Wakamatsu-Kawada Station': { lat: 35.6992, lng: 139.7178 },
  'Higashi-Shinjuku Station': { lat: 35.7010, lng: 139.7070 },
  'Kuramae Station': { lat: 35.7036, lng: 139.7906 },
  'Asakusa Station': { lat: 35.7148, lng: 139.7967 },
  'Ryogoku Station': { lat: 35.6970, lng: 139.7934 },
  'Otsuka Station': { lat: 35.7318, lng: 139.7282 },
  'Takadanobaba Station': { lat: 35.7123, lng: 139.7039 },
  'Meidaimae Station': { lat: 35.6684, lng: 139.6507 },
  'Ontakesan Station': { lat: 35.5850, lng: 139.6826 },
  'Kugahara Station': { lat: 35.5863, lng: 139.6852 },
  'Nishi-Magome Station': { lat: 35.5858, lng: 139.7059 },
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
  '御嶽山駅': { lat: 35.5850, lng: 139.6826 },
  '久が原駅': { lat: 35.5863, lng: 139.6852 },
  '西馬込駅': { lat: 35.5858, lng: 139.7059 },
  
  // ===== YOKOHAMA/KANAGAWA =====
  '横浜駅': { lat: 35.4662, lng: 139.6227 },
  '川崎駅': { lat: 35.5308, lng: 139.6988 },
  '桜木町駅': { lat: 35.4510, lng: 139.6310 },
  '関内駅': { lat: 35.4432, lng: 139.6364 },
  'みなとみらい駅': { lat: 35.4577, lng: 139.6325 },
  
  // ===== OSAKA =====
  '大阪駅': { lat: 34.7025, lng: 135.4959 },
  '梅田駅': { lat: 34.7019, lng: 135.4998 },
  '難波駅': { lat: 34.6647, lng: 135.5030 },
  '天王寺駅': { lat: 34.6472, lng: 135.5140 },
  '心斎橋駅': { lat: 34.6785, lng: 135.4992 },
  '本町駅': { lat: 34.6825, lng: 135.4971 },
  '淀屋橋駅': { lat: 34.6892, lng: 135.4977 },
  '堺筋本町駅': { lat: 34.6817, lng: 135.5053 },
  '谷町四丁目駅': { lat: 34.6818, lng: 135.5188 },
  '森ノ宮駅': { lat: 34.6806, lng: 135.5321 },
  '鶴橋駅': { lat: 34.6653, lng: 135.5310 },
  '京橋駅': { lat: 34.6965, lng: 135.5342 },
  '福島駅': { lat: 34.6961, lng: 135.4875 },
  
  // ===== KYOTO =====
  '京都駅': { lat: 34.9858, lng: 135.7588 },
  '四条駅': { lat: 35.0037, lng: 135.7584 },
  '烏丸駅': { lat: 35.0037, lng: 135.7595 },
  '河原町駅': { lat: 35.0074, lng: 135.7704 },
  
  // ===== NAGOYA =====
  '名古屋駅': { lat: 35.1709, lng: 136.8793 },
  '栄駅': { lat: 35.1704, lng: 136.9086 },
  '金山駅': { lat: 35.1426, lng: 136.9010 },
  
  // ===== FUKUOKA =====
  '博多駅': { lat: 33.5902, lng: 130.4206 },
  '天神駅': { lat: 33.5892, lng: 130.3988 },
  '中洲川端駅': { lat: 33.5944, lng: 130.4064 },
  
  // ===== SAPPORO / HOKKAIDO =====
  '札幌駅': { lat: 43.0687, lng: 141.3508 },
  '大通駅': { lat: 43.0607, lng: 141.3545 },
  'すすきの駅': { lat: 43.0554, lng: 141.3534 },
  '澄川駅': { lat: 43.0157, lng: 141.3697 },
  '南郷7丁目駅': { lat: 43.0404, lng: 141.4114 },
  '北34条駅': { lat: 43.1080, lng: 141.3422 },
  '麻生駅': { lat: 43.1121, lng: 141.3354 },
  '北24条駅': { lat: 43.0909, lng: 141.3442 },
  '北18条駅': { lat: 43.0785, lng: 141.3476 },
  '北12条駅': { lat: 43.0696, lng: 141.3496 },
  'さっぽろ駅': { lat: 43.0687, lng: 141.3508 },
  '豊水すすきの駅': { lat: 43.0551, lng: 141.3570 },
  '学園前駅': { lat: 43.0457, lng: 141.3714 },
  '豊平公園駅': { lat: 43.0441, lng: 141.3836 },
  '美園駅': { lat: 43.0377, lng: 141.3914 },
  '白石駅': { lat: 43.0461, lng: 141.4041 },
  '南郷13丁目駅': { lat: 43.0392, lng: 141.4037 },
  '南郷18丁目駅': { lat: 43.0328, lng: 141.4033 },
  '大谷地駅': { lat: 43.0388, lng: 141.4210 },
  '福住駅': { lat: 43.0198, lng: 141.4456 },
  '円山公園駅': { lat: 43.0554, lng: 141.3188 },
  '西28丁目駅': { lat: 43.0424, lng: 141.3236 },
  '西18丁目駅': { lat: 43.0481, lng: 141.3354 },
  '西11丁目駅': { lat: 43.0537, lng: 141.3446 },
  '中島公園駅': { lat: 43.0453, lng: 141.3541 },
  '幌平橋駅': { lat: 43.0388, lng: 141.3530 },
  '中の島駅': { lat: 43.0333, lng: 141.3506 },
  '平岸駅': { lat: 43.0284, lng: 141.3687 },
  '南平岸駅': { lat: 43.0236, lng: 141.3708 },
  '葛西駅': { lat: 43.0181, lng: 141.3741 },
  '新札幌駅': { lat: 43.0386, lng: 141.4727 },
  '真駒内駅': { lat: 42.9910, lng: 141.3583 },
  '平和駅': { lat: 42.9961, lng: 141.3411 },
  '北海道医療大学駅': { lat: 43.1150, lng: 141.5000 },
  '石狩当別駅': { lat: 43.3189, lng: 141.4636 },
  '小樽駅': { lat: 43.1976, lng: 140.9936 },
  '旭川駅': { lat: 43.7624, lng: 142.3585 },
  '函館駅': { lat: 41.7736, lng: 140.7264 },
  
  // ===== OKINAWA =====
  '那覇駅': { lat: 26.2109, lng: 127.6792 },
  '県庁前駅': { lat: 26.2123, lng: 127.6798 },
  
  // ===== SAITAMA =====
  '大宮駅': { lat: 35.9063, lng: 139.6237 },
  '浦和駅': { lat: 35.8585, lng: 139.6567 },
  
  // ===== CHIBA =====
  '千葉駅': { lat: 35.6130, lng: 140.1134 },
  '船橋駅': { lat: 35.7015, lng: 139.9844 },
};

// Ward/area coordinates for fallback - All Japan
const areaCoordinates: Record<string, { lat: number; lng: number }> = {
  // ===== TOKYO =====
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
  '八王子市': { lat: 35.6662, lng: 139.3160 },
  '調布市': { lat: 35.6505, lng: 139.5408 },
  
  // ===== KANAGAWA =====
  '横浜市': { lat: 35.4437, lng: 139.6380 },
  '川崎市': { lat: 35.5308, lng: 139.7030 },
  '相模原市': { lat: 35.5713, lng: 139.3734 },
  
  // ===== OSAKA =====
  '大阪市': { lat: 34.6937, lng: 135.5023 },
  '大阪府': { lat: 34.6863, lng: 135.5197 },
  '堺市': { lat: 34.5733, lng: 135.4831 },
  
  // ===== KYOTO =====
  '京都市': { lat: 35.0116, lng: 135.7681 },
  '京都府': { lat: 35.0210, lng: 135.7556 },
  
  // ===== AICHI/NAGOYA =====
  '名古屋市': { lat: 35.1815, lng: 136.9066 },
  '愛知県': { lat: 35.1802, lng: 136.9066 },
  
  // ===== FUKUOKA =====
  '福岡市': { lat: 33.5902, lng: 130.4017 },
  '福岡県': { lat: 33.6064, lng: 130.4183 },
  
  // ===== HOKKAIDO / SAPPORO =====
  '札幌市': { lat: 43.0618, lng: 141.3545 },
  '北海道': { lat: 43.2203, lng: 142.8635 },
  '札幌市中央区': { lat: 43.0554, lng: 141.3410 },
  '札幌市北区': { lat: 43.0909, lng: 141.3408 },
  '札幌市東区': { lat: 43.0764, lng: 141.3636 },
  '札幌市白石区': { lat: 43.0478, lng: 141.4050 },
  '札幌市豊平区': { lat: 43.0314, lng: 141.3800 },
  '札幌市南区': { lat: 42.9903, lng: 141.3539 },
  '札幌市西区': { lat: 43.0744, lng: 141.3008 },
  '札幌市厚別区': { lat: 43.0361, lng: 141.4639 },
  '札幌市手稲区': { lat: 43.1219, lng: 141.2458 },
  '札幌市清田区': { lat: 42.9997, lng: 141.4439 },
  
  // ===== OKINAWA =====
  '那覇市': { lat: 26.2126, lng: 127.6809 },
  '沖縄県': { lat: 26.2124, lng: 127.6809 },
  
  // ===== SAITAMA =====
  'さいたま市': { lat: 35.8617, lng: 139.6455 },
  '埼玉県': { lat: 35.8570, lng: 139.6489 },
  
  // ===== CHIBA =====
  '千葉市': { lat: 35.6073, lng: 140.1065 },
  '千葉県': { lat: 35.6051, lng: 140.1233 },

  // ===== ADDITIONAL STATIONS (Kanagawa area) =====
  '京王永山駅': { lat: 35.6230, lng: 139.4224 },
  '平塚駅': { lat: 35.3285, lng: 139.3493 },
  '北久里浜駅': { lat: 35.2225, lng: 139.7152 },
  '鎌倉駅': { lat: 35.3190, lng: 139.5506 },
  '逗子駅': { lat: 35.2959, lng: 139.5786 },
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
// ScraperAPI configuration
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
const USE_SCRAPER_API = !!SCRAPER_API_KEY;

// Convert URL to ScraperAPI proxy URL
function getProxyUrl(url: string): string {
  if (!USE_SCRAPER_API) return url;
  return `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}&country_code=jp`;
}

export async function fetchRealListings(): Promise<DetailedListing[]> {
  const listings: DetailedListing[] = [];
  let browser: any = null;
  
  try {
    console.log('Launching browser...');
    console.log(USE_SCRAPER_API ? '✓ Using ScraperAPI proxy' : '⚠ No ScraperAPI key - using direct connection (may be blocked)');
    
    const launchArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ];
    
    // Add ScraperAPI proxy if configured
    if (USE_SCRAPER_API) {
      launchArgs.push('--proxy-server=http://proxy-server.scraperapi.com:8001');
    }
    
    browser = await puppeteer.launch({
      headless: true,
      args: launchArgs,
    });
    
    const page = await browser.newPage();
    
    // Authenticate with ScraperAPI if using proxy
    if (USE_SCRAPER_API) {
      await page.authenticate({
        username: 'scraperapi',
        password: SCRAPER_API_KEY,
      });
    }
    
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Step 1: Get all listing URLs from multiple pages
    const allListingUrls: Array<{ url: string; title: string; price: number; location: string; station: string; walkTime: number }> = [];
    const seenUrls = new Set<string>();
    
    // Define pages to scrape - All Japan regions (expanded)
    const pagesToScrape = [
      // Tokyo (expanded to 10 pages)
      'https://weeklyandmonthly.com/tokyo/',
      'https://weeklyandmonthly.com/tokyo/?page=2',
      'https://weeklyandmonthly.com/tokyo/?page=3',
      'https://weeklyandmonthly.com/tokyo/?page=4',
      'https://weeklyandmonthly.com/tokyo/?page=5',
      'https://weeklyandmonthly.com/tokyo/?page=6',
      'https://weeklyandmonthly.com/tokyo/?page=7',
      'https://weeklyandmonthly.com/tokyo/?page=8',
      'https://weeklyandmonthly.com/tokyo/?page=9',
      'https://weeklyandmonthly.com/tokyo/?page=10',
      // Osaka (expanded to 8 pages)
      'https://weeklyandmonthly.com/osaka/',
      'https://weeklyandmonthly.com/osaka/?page=2',
      'https://weeklyandmonthly.com/osaka/?page=3',
      'https://weeklyandmonthly.com/osaka/?page=4',
      'https://weeklyandmonthly.com/osaka/?page=5',
      'https://weeklyandmonthly.com/osaka/?page=6',
      'https://weeklyandmonthly.com/osaka/?page=7',
      'https://weeklyandmonthly.com/osaka/?page=8',
      // Kyoto (expanded to 6 pages)
      'https://weeklyandmonthly.com/kyoto/',
      'https://weeklyandmonthly.com/kyoto/?page=2',
      'https://weeklyandmonthly.com/kyoto/?page=3',
      'https://weeklyandmonthly.com/kyoto/?page=4',
      'https://weeklyandmonthly.com/kyoto/?page=5',
      'https://weeklyandmonthly.com/kyoto/?page=6',
      // Kanagawa (Yokohama area)
      'https://weeklyandmonthly.com/kanagawa/',
      'https://weeklyandmonthly.com/kanagawa/?page=2',
      'https://weeklyandmonthly.com/kanagawa/?page=3',
      'https://weeklyandmonthly.com/kanagawa/?page=4',
      'https://weeklyandmonthly.com/kanagawa/?page=5',
      // Saitama
      'https://weeklyandmonthly.com/saitama/',
      'https://weeklyandmonthly.com/saitama/?page=2',
      'https://weeklyandmonthly.com/saitama/?page=3',
      // Chiba
      'https://weeklyandmonthly.com/chiba/',
      'https://weeklyandmonthly.com/chiba/?page=2',
      'https://weeklyandmonthly.com/chiba/?page=3',
      // Fukuoka (expanded)
      'https://weeklyandmonthly.com/fukuoka/',
      'https://weeklyandmonthly.com/fukuoka/?page=2',
      'https://weeklyandmonthly.com/fukuoka/?page=3',
      'https://weeklyandmonthly.com/fukuoka/?page=4',
      'https://weeklyandmonthly.com/fukuoka/?page=5',
      // Sapporo
      'https://weeklyandmonthly.com/hokkaido/',
      'https://weeklyandmonthly.com/hokkaido/?page=2',
      'https://weeklyandmonthly.com/hokkaido/?page=3',
      'https://weeklyandmonthly.com/hokkaido/?page=4',
      // Nagoya
      'https://weeklyandmonthly.com/aichi/',
      'https://weeklyandmonthly.com/aichi/?page=2',
      'https://weeklyandmonthly.com/aichi/?page=3',
      // Okinawa
      'https://weeklyandmonthly.com/okinawa/',
      'https://weeklyandmonthly.com/okinawa/?page=2',
      'https://weeklyandmonthly.com/okinawa/?page=3',
    ];
    
    for (const pageUrl of pagesToScrape) {
      try {
        console.log(`Fetching listing URLs from ${pageUrl}...`);
        await page.goto(pageUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 20000,
        });
        await new Promise(r => setTimeout(r, 1000)); // Shorter wait for faster scraping
        
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
    // OPTIMIZED: Higher limit with more concurrency for more listings
    const MAX_LISTINGS = 150; // Increased to get more listings
    const CONCURRENT_LIMIT = 5; // Process 5 listings at a time (increased from 3)
    
    console.log(`Processing ${Math.min(listingUrls.length, MAX_LISTINGS)} listings with ${CONCURRENT_LIMIT} concurrent requests...`);
    
    // Process listings in batches
    for (let i = 0; i < Math.min(listingUrls.length, MAX_LISTINGS); i += CONCURRENT_LIMIT) {
      const batch = listingUrls.slice(i, i + CONCURRENT_LIMIT);
      
      const batchPromises = batch.map(async (listingData, batchIndex) => {
        const { url, title, price, location, station, walkTime } = listingData;
        const index = i + batchIndex;
        
        try {
          console.log(`  [${index + 1}/${Math.min(listingUrls.length, MAX_LISTINGS)}] ${title.substring(0, 35)}...`);
          
          // Optimized: faster page load
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 12000 });
          
          // Wait for images with shorter timeout
          await page.waitForSelector('img[src*="imageflux"]', { timeout: 3000 }).catch(() => {});
          await new Promise(r => setTimeout(r, 800)); // Short delay for images to load
          
          // Extract data with optimized selectors
          const detailData = await page.evaluate(() => {
            // Quick photo extraction - prioritize imageflux CDN
            const allPhotos: string[] = [];
            document.querySelectorAll('img').forEach((img) => {
              const src = img.getAttribute('src') || img.getAttribute('data-src');
              if (src && src.includes('imageflux') && !allPhotos.includes(src)) {
                allPhotos.push(src);
              }
            });
            
            // Get description from 物件概要 - properly parse structured data
            let description = '';
            const outlineData: Record<string, string> = {};
            
            // Find the 物件概要 section and extract key-value pairs
            const headings = document.querySelectorAll('h2, h3, .section-title, h2 span');
            for (const heading of headings) {
              if (heading.textContent?.includes('物件概要')) {
                const container = heading.closest('section, .section') || heading.parentElement;
                if (container) {
                  // Look for dt/dd or th/td pairs within the container
                  const rows = container.querySelectorAll('dl > div, tr, .spec-item, dl > dt, dt');
                  
                  for (const row of rows) {
                    const labelEl = row.querySelector('dt, th, .label') || (row.tagName === 'DT' ? row : null);
                    const valueEl = row.querySelector('dd, td, .value') || row.nextElementSibling;
                    
                    if (labelEl && valueEl) {
                      const label = labelEl.textContent?.trim() || '';
                      const value = valueEl.textContent?.trim() || '';
                      if (label && value && label !== value) {
                        outlineData[label] = value;
                      }
                    }
                  }
                  
                  // Also try finding by text patterns if structured parsing didn't work
                  if (Object.keys(outlineData).length === 0) {
                    const allText = container.textContent || '';
                    // Extract key sections using regex
                    const sections = [
                      { key: '所在地', pattern: /所在地\s*([^\n]+?)(?=\s*[アクセス間取り面積築年数]|$)/ },
                      { key: 'アクセス', pattern: /アクセス\s*([\s\S]+?)(?=\s*[間取り面積築年数所在地]|$)/ },
                      { key: '間取り', pattern: /間取り\s*([^\n]+?)(?=\s*[面積築年数建物構造]|$)/ },
                      { key: '面積', pattern: /面積\s*([^\n]+?)(?=\s*[築年数建物構造物件種別]|$)/ },
                      { key: '築年数', pattern: /築年数\s*([^\n]+?)(?=\s*[建物構造物件種別建物階数]|$)/ },
                      { key: '建物構造', pattern: /建物構造\s*([^\n]+?)(?=\s*[物件種別建物階数総戸数]|$)/ },
                      { key: '物件種別', pattern: /物件種別\s*([^\n]+?)(?=\s*[建物階数総戸数契約形態]|$)/ },
                      { key: '建物階数', pattern: /建物階数\s*([^\n]+?)(?=\s*[総戸数契約形態取引態様]|$)/ },
                      { key: '総戸数', pattern: /総戸数\s*([^\n]+?)(?=\s*[契約形態取引態様部屋の向き]|$)/ },
                      { key: '契約形態', pattern: /契約形態\s*([^\n]+?)(?=\s*[取引態様部屋の向き鍵の種類]|$)/ },
                      { key: '取引態様', pattern: /取引態様\s*([^\n]+?)(?=\s*[部屋の向き鍵の種類ベッドタイプ]|$)/ },
                      { key: '部屋の向き', pattern: /部屋の向き\s*([^\n]+?)(?=\s*[鍵の種類ベッドタイプ保証人]|$)/ },
                      { key: '保証人', pattern: /保証人\s*([^\n]+?)(?=\s*[$\n]|$)/ },
                    ];
                    
                    for (const section of sections) {
                      const match = allText.match(section.pattern);
                      if (match) {
                        outlineData[section.key] = match[1].trim();
                      }
                    }
                  }
                }
                break;
              }
            }
            
            // Format the description from extracted data
            if (Object.keys(outlineData).length > 0) {
              const parts: string[] = [];
              const order = ['所在地', 'アクセス', '間取り', '面積', '築年数', '建物構造', '物件種別', '建物階数', '総戸数', '契約形態', '取引態様', '部屋の向き', '保証人'];
              for (const key of order) {
                if (outlineData[key]) {
                  // Normalize whitespace - replace multiple spaces/newlines with single space
                  const cleanValue = outlineData[key].replace(/\s+/g, ' ').trim();
                  parts.push(`${key}: ${cleanValue}`);
                }
              }
              description = parts.join(' / ');
            } else {
              // Fallback: use the title as description
              description = document.querySelector('h1')?.textContent?.trim() || '';
            }
            
            // Quick pricing plan extraction
            const pricingPlans: any[] = [];
            document.querySelectorAll('.plan-list__item').forEach((planEl) => {
              const name = planEl.querySelector('.plan-list__item-title')?.textContent?.trim() || '';
              const monthlyText = planEl.querySelector('.plan-list__outline-price.em')?.textContent || '';
              const monthlyMatch = monthlyText.match(/([\d,]+)/);
              const monthlyPrice = monthlyMatch ? parseInt(monthlyMatch[1].replace(/,/g, ''), 10) : 0;
              
              if (name && monthlyPrice > 0) {
                pricingPlans.push({ name, monthlyPrice });
              }
            });
            
            // Get address and access info
            let fullAddress = '';
            let detailStation = '';
            let detailWalkTime = 10;
            
            // Try to find structured data (th/dl pattern common on these sites)
            document.querySelectorAll('th, dt, .label').forEach((label) => {
              const labelText = label.textContent?.trim() || '';
              const valueEl = label.nextElementSibling || label.closest('tr')?.querySelector('td, dd');
              const valueText = valueEl?.textContent?.trim() || '';
              
              if (labelText.includes('所在地')) {
                fullAddress = valueText;
              }
              if (labelText.includes('アクセス') || labelText.includes('交通')) {
                // Parse station and walk time
                const walkMatch = valueText.match(/徒歩\s*(\d+)\s*分/);
                if (walkMatch) {
                  detailWalkTime = parseInt(walkMatch[1], 10);
                }
                const stationMatch = valueText.match(/「(.+?)」/);
                if (stationMatch) {
                  detailStation = stationMatch[1];
                }
              }
            });
            
            // Fallback: search for address/access in any element
            if (!fullAddress) {
              document.querySelectorAll('p, div').forEach((el) => {
                const text = el.textContent || '';
                const match = text.match(/(東京都|大阪府|京都府|北海道|福岡県|愛知県|北海道|兵庫県|広島県|宮城県)[^\n]{5,60}/);
                if (match && text.length < 150) {
                  fullAddress = match[0].trim();
                }
              });
            }
            
            // Fallback: parse station from access info
            if (!detailStation) {
              document.querySelectorAll('p, div, span').forEach((el) => {
                const text = el.textContent || '';
                const stationMatch = text.match(/「(.+?)」/);
                if (stationMatch && (text.includes('徒歩') || text.includes('線'))) {
                  detailStation = stationMatch[1];
                  const walkMatch = text.match(/徒歩\s*(\d+)\s*分/);
                  if (walkMatch) {
                    detailWalkTime = parseInt(walkMatch[1], 10);
                  }
                }
              });
            }
            
            return { photos: allPhotos.slice(0, 10), description, pricingPlans, fullAddress, detailStation, detailWalkTime };
          });
          
          // Use detail page station if found, otherwise fall back to listing page station
          const finalStation = detailData.detailStation || station;
          const finalWalkTime = detailData.detailWalkTime || walkTime;
          
          // Get coordinates
          let lat: number | undefined;
          let lng: number | undefined;
          const stationCoords = getCoordinatesFromStation(finalStation);
          if (stationCoords) {
            lat = stationCoords.lat + (Math.random() - 0.5) * 0.01;
            lng = stationCoords.lng + (Math.random() - 0.5) * 0.01;
          } else if (detailData.fullAddress) {
            // Fallback: get coordinates from area/ward in address
            const areaCoords = getCoordinatesFromArea(detailData.fullAddress);
            if (areaCoords) {
              lat = areaCoords.lat + (Math.random() - 0.5) * 0.005;
              lng = areaCoords.lng + (Math.random() - 0.5) * 0.005;
            }
          }
          
          // Build English description from key data points
          const enDescription = [
            `Monthly mansion in ${finalStation} area`,
            `${finalWalkTime} min walk to station`,
            detailData.fullAddress ? `Address: ${detailData.fullAddress}` : null,
            detailData.pricingPlans[0]?.monthlyPrice ? `From ¥${detailData.pricingPlans[0].monthlyPrice.toLocaleString()}/month` : null,
          ].filter(Boolean).join('. ');
          
          const listing: DetailedListing = {
            externalId: `wm-${url.match(/id=(\d+)/)?.[1] || index}`,
            sourceUrl: url,
            type: 'monthly_mansion',
            price: detailData.pricingPlans[0]?.monthlyPrice || price,
            deposit: null,
            keyMoney: null,
            nearestStation: finalStation,
            walkTime: finalWalkTime,
            furnished: true,
            foreignerFriendly: true,
            photos: detailData.photos,
            descriptionEn: enDescription || title,
            descriptionJp: detailData.description || title,
            location: detailData.fullAddress || location || 'Tokyo',
            lat,
            lng,
            pricingPlans: detailData.pricingPlans,
            tags: [],
          };
          
          console.log(`      ✓ ${detailData.photos.length} photos`);
          return listing;
          
        } catch (error) {
          console.log(`      ✗ Failed: ${(error as Error).message.substring(0, 50)}`);
          return null;
        }
      });
      
      // Wait for batch to complete
      const batchResults = await Promise.all(batchPromises);
      listings.push(...batchResults.filter((l): l is DetailedListing => l !== null));
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