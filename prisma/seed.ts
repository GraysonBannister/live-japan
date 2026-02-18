import { prisma } from '../app/lib/prisma';

const tokyoAreas = [
  'Shibuya', 'Shinjuku', 'Harajuku', 'Roppongi', 'Ginza', 'Akihabara',
  'Ueno', 'Asakusa', 'Ikebukuro', 'Meguro', 'Ebisu', 'Daikanyama',
  'Nakameguro', 'Shimokitazawa', 'Koenji', 'Kichijoji', 'Omotesando',
  'Aoyama', 'Azabu', 'Hiroo', 'Yoyogi', 'Sangenjaya', 'Jiyugaoka',
  'Futako-Tamagawa', 'Kagurazaka', 'Yanaka', 'Nippori', 'Monzen-Nakacho',
  'Tsukiji', 'Toyosu', 'Odaiba', 'Marunouchi', 'Otemachi', 'Toranomon',
  'Shimbashi', 'Hamamatsucho', 'Shinagawa', 'Gotanda', 'Osaki',
  'Naka-Meguro', 'Gakugei-Daigaku', 'Denenchofu', 'Musashi-Kosugi'
];

const stations = [
  { name: 'Shibuya Station', area: 'Shibuya' },
  { name: 'Harajuku Station', area: 'Harajuku' },
  { name: 'Shinjuku Station', area: 'Shinjuku' },
  { name: 'Roppongi Station', area: 'Roppongi' },
  { name: 'Ginza Station', area: 'Ginza' },
  { name: 'Akihabara Station', area: 'Akihabara' },
  { name: 'Ueno Station', area: 'Ueno' },
  { name: 'Asakusa Station', area: 'Asakusa' },
  { name: 'Ikebukuro Station', area: 'Ikebukuro' },
  { name: 'Meguro Station', area: 'Meguro' },
  { name: 'Ebisu Station', area: 'Ebisu' },
  { name: 'Daikanyama Station', area: 'Daikanyama' },
  { name: 'Nakameguro Station', area: 'Nakameguro' },
  { name: 'Shimokitazawa Station', area: 'Shimokitazawa' },
  { name: 'Koenji Station', area: 'Koenji' },
  { name: 'Kichijoji Station', area: 'Kichijoji' },
  { name: 'Omotesando Station', area: 'Omotesando' },
  { name: 'Aoyama-Itchome Station', area: 'Aoyama' },
  { name: 'Azabu-Juban Station', area: 'Azabu' },
  { name: 'Hiroo Station', area: 'Hiroo' },
  { name: 'Yoyogi Station', area: 'Yoyogi' },
  { name: 'Sangenjaya Station', area: 'Sangenjaya' },
  { name: 'Jiyugaoka Station', area: 'Jiyugaoka' },
  { name: 'Futako-Tamagawa Station', area: 'Futako-Tamagawa' },
  { name: 'Kagurazaka Station', area: 'Kagurazaka' },
  { name: 'Nippori Station', area: 'Nippori' },
  { name: 'Monzen-Nakacho Station', area: 'Monzen-Nakacho' },
  { name: 'Tsukiji Station', area: 'Tsukiji' },
  { name: 'Toyosu Station', area: 'Toyosu' },
  { name: 'Odaiba-Kaihinkoen Station', area: 'Odaiba' },
  { name: 'Tokyo Station', area: 'Marunouchi' },
  { name: 'Otemachi Station', area: 'Otemachi' },
  { name: 'Toranomon Station', area: 'Toranomon' },
  { name: 'Shimbashi Station', area: 'Shimbashi' },
  { name: 'Hamamatsucho Station', area: 'Hamamatsucho' },
  { name: 'Shinagawa Station', area: 'Shinagawa' },
  { name: 'Gotanda Station', area: 'Gotanda' },
  { name: 'Osaki Station', area: 'Osaki' },
  { name: 'Gakugei-Daigaku Station', area: 'Gakugei-Daigaku' },
  { name: 'Denenchofu Station', area: 'Denenchofu' },
  { name: 'Musashi-Kosugi Station', area: 'Musashi-Kosugi' }
];

const areaCoords: { [key: string]: { lat: number; lng: number } } = {
  'Shibuya': { lat: 35.6618, lng: 139.7041 },
  'Shinjuku': { lat: 35.6938, lng: 139.7034 },
  'Harajuku': { lat: 35.6702, lng: 139.7027 },
  'Roppongi': { lat: 35.6628, lng: 139.7314 },
  'Ginza': { lat: 35.6710, lng: 139.7650 },
  'Akihabara': { lat: 35.6984, lng: 139.7731 },
  'Ueno': { lat: 35.7089, lng: 139.7741 },
  'Asakusa': { lat: 35.7116, lng: 139.7966 },
  'Ikebukuro': { lat: 35.7295, lng: 139.7109 },
  'Meguro': { lat: 35.6415, lng: 139.6982 },
  'Ebisu': { lat: 35.6466, lng: 139.7101 },
  'Daikanyama': { lat: 35.6484, lng: 139.7033 },
  'Nakameguro': { lat: 35.6432, lng: 139.6987 },
  'Shimokitazawa': { lat: 35.6613, lng: 139.6683 },
  'Koenji': { lat: 35.7054, lng: 139.6499 },
  'Kichijoji': { lat: 35.7031, lng: 139.5798 },
  'Omotesando': { lat: 35.6652, lng: 139.7126 },
  'Aoyama': { lat: 35.6722, lng: 139.7230 },
  'Azabu': { lat: 35.6560, lng: 139.7338 },
  'Hiroo': { lat: 35.6523, lng: 139.7221 },
  'Yoyogi': { lat: 35.6831, lng: 139.7022 },
  'Sangenjaya': { lat: 35.6430, lng: 139.6703 },
  'Jiyugaoka': { lat: 35.6076, lng: 139.6686 },
  'Futako-Tamagawa': { lat: 35.6116, lng: 139.6266 },
  'Kagurazaka': { lat: 35.7040, lng: 139.7366 },
  'Yanaka': { lat: 35.7260, lng: 139.7641 },
  'Nippori': { lat: 35.7278, lng: 139.7709 },
  'Monzen-Nakacho': { lat: 35.6705, lng: 139.7963 },
  'Tsukiji': { lat: 35.6652, lng: 139.7700 },
  'Toyosu': { lat: 35.6550, lng: 139.7961 },
  'Odaiba': { lat: 35.6300, lng: 139.7764 },
  'Marunouchi': { lat: 35.6812, lng: 139.7639 },
  'Otemachi': { lat: 35.6841, lng: 139.7661 },
  'Toranomon': { lat: 35.6700, lng: 139.7495 },
  'Shimbashi': { lat: 35.6662, lng: 139.7582 },
  'Hamamatsucho': { lat: 35.6554, lng: 139.7574 },
  'Shinagawa': { lat: 35.6285, lng: 139.7388 },
  'Gotanda': { lat: 35.6259, lng: 139.7235 },
  'Osaki': { lat: 35.6198, lng: 139.7282 },
  'Naka-Meguro': { lat: 35.6432, lng: 139.6987 },
  'Gakugei-Daigaku': { lat: 35.6304, lng: 139.6847 },
  'Denenchofu': { lat: 35.5877, lng: 139.6670 },
  'Musashi-Kosugi': { lat: 35.5750, lng: 139.6594 }
};

const propertyTypes = ['monthly_mansion', 'weekly_mansion', 'apartment'] as string[];

const descriptionsEn = [
  'Modern furnished apartment with high-speed internet, perfect for remote workers.',
  'Cozy studio in a quiet neighborhood, walking distance to popular cafes and shops.',
  'Spacious 1LDK with balcony, newly renovated with modern appliances.',
  'Designer apartment with premium furnishings, ideal for short-term stays.',
  'Compact but efficient unit, great value in central Tokyo location.',
  'Luxury serviced apartment with concierge service and weekly cleaning.',
  'Traditional Japanese style meets modern comfort in this unique property.',
  'Pet-friendly apartment with nearby parks and walking trails.',
  'Bright corner unit with floor-to-ceiling windows and city views.',
  'Newly built property with smart home features and security system.',
  'Walking distance to major train lines, perfect for commuters.',
  'Quiet residential area with easy access to shopping and dining.',
  'Fully equipped kitchen, ideal for long-term residents who love to cook.',
  'Rooftop terrace access with stunning views of Tokyo skyline.',
  'Ground floor unit with small garden space, rare in Tokyo.',
  'High-security building with auto-lock entrance and video intercom.',
  'Close to international supermarkets and English-speaking services.',
  'Minimalist design with Scandinavian furniture and plenty of storage.',
  'Family-friendly neighborhood with parks and international schools nearby.',
  'Trendy loft-style apartment in the heart of the fashion district.'
];

const descriptionsJp = [
  '高速インターネット完備のモダンな家具付きアパート、リモートワーカーに最適。',
  '静かな住宅街の居心地の良いスタジオ、人気カフェやショップまで徒歩圏内。',
  'バルコニー付きの広々とした1LDK、最新の設備で新規リノベーション済み。',
  'プレミアム家具付きのデザイナーズアパート、短期滞在に最適。',
  'コンパクトだけど効率的なユニット、都心の好立地でお得。',
  'コンシェルジュサービスと週刊清掃付きの高級サービスアパート。',
  '伝統的な日本スタイルとモダンな快適性が融合したユニークな物件。',
  'ペット可アパート、近隣に公園や散歩コースあり。',
  '床から天井までの窓と都市の景色が広がる明るい角部屋。',
  'スマートホーム機能とセキュリティシステムを備えた新築物件。',
  '主要路線まで徒歩圏内、通勤者に最適。',
  '買い物や飲食店にアクセスしやすい静かな住宅街。',
  '設備の整ったキッチン、料理好きの長期滞在者に最適。',
  '東京のスカイラインが一望できる絶景の屋上テラス付き。',
  '小さな庭付きの1階ユニット、東京では希少。',
  'オートロックエントランスとモニター付きインターホンの高セキュリティ物件。',
  '国際スーパーや英語対応サービスに近い。',
  '北欧家具と豊富な収納スペースを備えたミニマルデザイン。',
  '公園や近隣にインターナショナルスクールがあるファミリー向け住宅街。',
  'ファッション街の中心にあるトレンディなロフトスタイルアパート。'
];

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePhotos(area: string, index: number): string[] {
  const photoCount = getRandomInt(3, 6);
  return Array.from({ length: photoCount }, (_, i) => 
    `https://images.unsplash.com/photo-${[
      '1502672260266-1c1ef2d93688', // apartment interior
      '1522708323590-d24dbb6b0267', // modern living room
      '1502005229762-cf1b2da7c5d6', // cozy apartment
      '1493809842364-78817add7ffb', // minimalist apartment
      '1484154218962-a1c002085d2f', // kitchen
      '1512918760513-95f1926323bc', // bedroom
      '1505693416388-ac5ce068fe85', // bathroom
      '1484101403233-56c5f73aa31f', // balcony
    ][(index + i) % 8]}?w=800&q=80`
  );
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.property.deleteMany();
  console.log('🗑️  Cleared existing properties');

  const properties = [];

  for (let i = 0; i < 75; i++) {
    const area = getRandomElement(tokyoAreas);
    const station = stations.find(s => s.area === area) || getRandomElement(stations);
    const type = getRandomElement(propertyTypes);
    const descIndex = i % descriptionsEn.length;
    
    // Price ranges based on type
    let minPrice = 80000;
    let maxPrice = 300000;
    if (type === 'weekly_mansion') {
      minPrice = 50000;
      maxPrice = 150000;
    } else if (type === 'apartment') {
      minPrice = 100000;
      maxPrice = 400000;
    }

    properties.push({
      type,
      price: getRandomInt(minPrice, maxPrice),
      deposit: Math.random() > 0.5 ? getRandomInt(0, 100000) : null,
      keyMoney: Math.random() > 0.5 ? getRandomInt(0, 100000) : null,
      nearestStation: station.name,
      walkTime: getRandomInt(3, 15),
      furnished: Math.random() > 0.3,
      foreignerFriendly: Math.random() > 0.2,
      photos: generatePhotos(area, i),
      descriptionEn: descriptionsEn[descIndex],
      descriptionJp: descriptionsJp[descIndex],
      location: area,
      lat: areaCoords[area].lat,
      lng: areaCoords[area].lng,
    });
  }

  for (const property of properties) {
    await prisma.property.create({ data: property });
  }

  console.log(`✅ Created ${properties.length} properties`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
