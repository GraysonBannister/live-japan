import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

const areas = ['Shibuya', 'Shinjuku', 'Akihabara', 'Asakusa', 'Roppongi', 'Ginza', 'Ueno', 'Ikebukuro', 'Harajuku', 'Meguro'];

const stations = ['Shibuya Station', 'Shinjuku Station', 'Akihabara Station', 'Asakusa Station', 'Roppongi Station', 'Ginza Station', 'Ueno Station', 'Ikebukuro Station', 'Harajuku Station', 'Meguro Station'];

const types = ['monthly_mansion', 'weekly_mansion', 'apartment'];

async function main() {
  for (let i = 0; i < 80; i++) { // 80 listings
    const type = types[Math.floor(Math.random() * types.length)];
    const location = areas[Math.floor(Math.random() * areas.length)];
    const nearestStation = stations[Math.floor(Math.random() * stations.length)];
    const photos = [
      `https://picsum.photos/seed/${i+1}/800/600`,
      `https://picsum.photos/seed/${i+2}/800/600`
    ];

    await prisma.property.create({
      data: {
        type,
        price: Math.floor(Math.random() * 150000) + 60000, // 60k to 210k JPY
        deposit: Math.random() > 0.3 ? Math.floor(Math.random() * 100000) + 50000 : null,
        keyMoney: Math.random() > 0.3 ? Math.floor(Math.random() * 100000) + 50000 : null,
        nearestStation,
        walkTime: Math.floor(Math.random() * 15) + 1, // 1-15 min
        furnished: Math.random() > 0.2,
        foreignerFriendly: Math.random() > 0.1,
        photos,
        descriptionEn: `Cozy ${type} in ${location}, Tokyo. Perfect for foreigners. Furnished: ${Math.random() > 0.2 ? 'Yes' : 'No'}. Walk to ${nearestStation} in a few minutes.`,
        descriptionJp: Math.random() > 0.5 ? `東京の${location}にある居心地の良い${type}。外国人向け。家具付き：${Math.random() > 0.2 ? 'はい' : 'いいえ'}。${nearestStation}まで徒歩数分。` : null,
        location,
      },
    });
  }
  console.log('Seeded 80 properties');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
