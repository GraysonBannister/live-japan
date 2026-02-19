// Check for hidden API endpoints on weeklyandmonthly.com
// Try common patterns for listing APIs

const API_ENDPOINTS = [
  'https://weeklyandmonthly.com/api/rooms',
  'https://weeklyandmonthly.com/api/v1/rooms',
  'https://weeklyandmonthly.com/api/search',
  'https://weeklyandmonthly.com/api/listings',
  'https://api.weeklyandmonthly.com/rooms',
  'https://api.weeklyandmonthly.com/v1/rooms',
  'https://weeklyandmonthly.com/json/rooms',
  'https://weeklyandmonthly.com/data/rooms.json',
  'https://weeklyandmonthly.com/srch/api/search',
  'https://weeklyandmonthly.com/ajax/room_list',
];

async function checkAPIs() {
  console.log('Checking for hidden API endpoints...\n');
  
  for (const endpoint of API_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      });
      
      console.log(`${endpoint}`);
      console.log(`  Status: ${response.status}`);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        console.log(`  Content-Type: ${contentType}`);
        
        if (contentType?.includes('json')) {
          const data = await response.json();
          console.log(`  ✓ FOUND JSON API!`);
          console.log(`  Data keys: ${Object.keys(data).join(', ')}`);
          if (Array.isArray(data)) {
            console.log(`  Array length: ${data.length}`);
          } else if (data.data && Array.isArray(data.data)) {
            console.log(`  Data array length: ${data.data.length}`);
          }
          console.log();
          return { found: true, endpoint, data };
        }
      }
      console.log();
    } catch (error) {
      console.log(`${endpoint}`);
      console.log(`  Error: ${error.message}\n`);
    }
  }
  
  return { found: false };
}

checkAPIs().then(result => {
  if (!result.found) {
    console.log('No JSON API found. Will need to use proxy service.');
  }
});
