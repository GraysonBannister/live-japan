import { prisma } from '../app/lib/prisma';

// Station coordinates mapping (English names)
const stationCoordinates: Record<string, { lat: number; lng: number }> = {
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
  // Additional stations found in data (English)
  'Kamakura Station': { lat: 35.3190, lng: 139.5506 },
  'Zushi Station': { lat: 35.2959, lng: 139.5786 },
  'Hiratsuka Station': { lat: 35.3285, lng: 139.3493 },
  'Kitakurihama Station': { lat: 35.2225, lng: 139.7152 },
  'Keio-Tama-Center Station': { lat: 35.6230, lng: 139.4224 },
  // Additional stations found in data (Japanese)
  '京王永山駅': { lat: 35.6230, lng: 139.4224 },
  '平塚駅': { lat: 35.3285, lng: 139.3493 },
  '北久里浜駅': { lat: 35.2225, lng: 139.7152 },
  '鎌倉駅': { lat: 35.3190, lng: 139.5506 },
  '逗子駅': { lat: 35.2959, lng: 139.5786 },
};

async function main() {
  console.log('=== Fixing Missing Coordinates ===\n');
  
  // Get all properties missing coordinates
  const properties = await prisma.property.findMany({
    where: {
      OR: [
        { lat: null },
        { lng: null }
      ]
    }
  });
  
  console.log(`Found ${properties.length} properties with missing coordinates\n`);
  
  let fixed = 0;
  let failed = 0;
  
  for (const prop of properties) {
    const coords = stationCoordinates[prop.nearestStation];
    
    if (coords) {
      await prisma.property.update({
        where: { id: prop.id },
        data: {
          lat: coords.lat,
          lng: coords.lng
        }
      });
      console.log(`✓ Fixed: ${prop.nearestStation} -> (${coords.lat}, ${coords.lng})`);
      fixed++;
    } else {
      console.log(`✗ No coordinates for: ${prop.nearestStation} (ID: ${prop.id})`);
      failed++;
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Fixed: ${fixed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total processed: ${properties.length}`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
