import { fetchRealListings } from './scripts/scrapers/weeklymonthly';

console.log('Testing stealth scraper...');
console.log('Timestamp:', new Date().toISOString());

fetchRealListings()
  .then(listings => {
    console.log('\n=== STEALTH SCRAPER RESULTS ===');
    console.log('Total listings scraped:', listings.length);
    
    if (listings.length === 0) {
      console.log('\nERROR: Still getting 0 listings. Stealth plugin did not help.');
      process.exit(1);
    }
    
    // Count by region
    const byRegion: Record<string, number> = {};
    listings.forEach(l => {
      const region = l.location.includes('大阪') ? 'Osaka' :
                    l.location.includes('京都') ? 'Kyoto' :
                    l.location.includes('福岡') ? 'Fukuoka' :
                    l.location.includes('札幌') || l.location.includes('北海道') ? 'Hokkaido' :
                    l.location.includes('横浜') || l.location.includes('川崎') ? 'Kanagawa' :
                    l.location.includes('東京') ? 'Tokyo' : 'Other';
      byRegion[region] = (byRegion[region] || 0) + 1;
    });
    
    console.log('\nBy region:');
    Object.entries(byRegion).forEach(([r, c]) => console.log(`  ${r}: ${c}`));
    
    console.log('\nFirst 5 listings:');
    listings.slice(0, 5).forEach(l => console.log(`  - ${l.location.substring(0, 60)}`));
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
