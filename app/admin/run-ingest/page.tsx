import Link from 'next/link';

// Static page for build compatibility
export default function RunIngestPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Run Scraper</h1>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-yellow-900 mb-2">⚠️ Local Execution Required</h2>
        <p className="text-yellow-800">
          The scraper requires server-side execution with database access. 
          Run this command locally:
        </p>
        <code className="block mt-3 p-4 bg-gray-900 text-gray-100 rounded text-sm font-mono">
          npm run ingest
        </code>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What the scraper does:</h3>
        <ul className="space-y-2 text-gray-700 list-disc list-inside">
          <li>Fetches listings from weeklyandmonthly.com</li>
          <li>Attempts to scrape from homes.jp and other sources</li>
          <li>Populates freshness fields (lastScrapedAt, confidence score, etc.)</li>
          <li>Sets 14-day auto-hide expiry</li>
          <li>Updates existing listings or creates new ones</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-4">After running:</h3>
        <ol className="space-y-2 text-gray-700 list-decimal list-inside">
          <li>Check the output for new/updated listings</li>
          <li>Commit the updated <code>dev.db</code> file</li>
          <li>Push to deploy updated listings to the site</li>
        </ol>
      </div>

      <div className="mt-6 flex gap-4">
        <Link
          href="/admin"
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Back to Dashboard
        </Link>
        <Link
          href="/admin/listings"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          View Listings
        </Link>
      </div>
    </div>
  );
}
