/**
 * API Detector Module
 * Checks for hidden/unofficial JSON APIs on real estate listing sites
 */

export interface APICheckResult {
  found: boolean;
  endpoint?: string;
  method?: string;
  sampleData?: any;
  error?: string;
}

// Common API endpoint patterns to check
const API_PATTERNS = [
  '/api/rooms',
  '/api/v1/rooms',
  '/api/v2/rooms',
  '/api/search',
  '/api/listings',
  '/api/properties',
  '/api/estates',
  '/json/rooms',
  '/json/search',
  '/data/rooms.json',
  '/ajax/room_list',
  '/ajax/search',
  '/wp-json/wp/v2/rooms',
  '/api/room/search',
  '/api/estate/search',
  '/rest/rooms',
  '/graphql',
  '/api/graphql',
];

/**
 * Check a single URL for API endpoints
 */
async function checkEndpoint(baseUrl: string, path: string): Promise<APICheckResult | null> {
  const url = new URL(path, baseUrl).toString();
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': baseUrl,
      },
    });
    
    if (!response.ok) return null;
    
    const contentType = response.headers.get('content-type') || '';
    
    // Check if response is JSON
    if (contentType.includes('json')) {
      const data = await response.json();
      return {
        found: true,
        endpoint: url,
        method: 'GET',
        sampleData: data,
      };
    }
    
    // Check if response looks like JSON even without proper content-type
    const text = await response.text();
    if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
      try {
        const data = JSON.parse(text);
        return {
          found: true,
          endpoint: url,
          method: 'GET',
          sampleData: data,
        };
      } catch {
        // Not valid JSON
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check for POST APIs with common search parameters
 */
async function checkPostEndpoint(baseUrl: string): Promise<APICheckResult | null> {
  const searchPaths = ['/api/search', '/api/rooms', '/ajax/search', '/rest/search'];
  
  for (const path of searchPaths) {
    const url = new URL(path, baseUrl).toString();
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Referer': baseUrl,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          area: 'tokyo',
          limit: 10,
          page: 1,
        }),
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('json')) {
          const data = await response.json();
          return {
            found: true,
            endpoint: url,
            method: 'POST',
            sampleData: data,
          };
        }
      }
    } catch {
      // Continue to next path
    }
  }
  
  return null;
}

/**
 * Check for GraphQL endpoints
 */
async function checkGraphQLEndpoint(baseUrl: string): Promise<APICheckResult | null> {
  const url = new URL('/graphql', baseUrl).toString();
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      body: JSON.stringify({
        query: '{ __schema { types { name } } }',
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.data || data.errors) {
        return {
          found: true,
          endpoint: url,
          method: 'POST',
          sampleData: data,
        };
      }
    }
  } catch {
    // Not a GraphQL endpoint
  }
  
  return null;
}

/**
 * Main function to detect APIs on a website
 */
export async function detectAPI(baseUrl: string): Promise<APICheckResult> {
  console.log(`\n🔍 Checking for APIs on: ${baseUrl}`);
  
  // Check GET endpoints
  for (const pattern of API_PATTERNS) {
    const result = await checkEndpoint(baseUrl, pattern);
    if (result?.found) {
      console.log(`  ✅ Found API: ${result.endpoint}`);
      return result;
    }
  }
  
  // Check POST endpoints
  const postResult = await checkPostEndpoint(baseUrl);
  if (postResult?.found) {
    console.log(`  ✅ Found POST API: ${postResult.endpoint}`);
    return postResult;
  }
  
  // Check GraphQL
  const graphqlResult = await checkGraphQLEndpoint(baseUrl);
  if (graphqlResult?.found) {
    console.log(`  ✅ Found GraphQL: ${graphqlResult.endpoint}`);
    return graphqlResult;
  }
  
  console.log(`  ❌ No API found`);
  return { found: false, error: 'No API endpoints detected' };
}

/**
 * Batch check multiple sites
 */
export async function detectAPIs(sites: string[]): Promise<Record<string, APICheckResult>> {
  const results: Record<string, APICheckResult> = {};
  
  for (const site of sites) {
    results[site] = await detectAPI(site);
  }
  
  return results;
}

// CLI usage
if (require.main === module) {
  const sites = [
    'https://weeklyandmonthly.com',
    'https://monthly.homes.jp',
    'https://www.000area-weekly.com',
    'https://www.weekly-monthly.net',
  ];
  
  detectAPIs(sites).then(results => {
    console.log('\n=== API DETECTION SUMMARY ===');
    for (const [site, result] of Object.entries(results)) {
      console.log(`\n${site}:`);
      console.log(`  Found: ${result.found ? '✅' : '❌'}`);
      if (result.endpoint) {
        console.log(`  Endpoint: ${result.endpoint}`);
      }
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      }
    }
  });
}
