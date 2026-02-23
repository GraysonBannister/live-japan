import Link from 'next/link';

export default function FreshnessReportPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Freshness Report</h1>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-yellow-900 mb-2">⚠️ Local Access Required</h2>
        <p className="text-yellow-800">
          Freshness reports require database access. Run the development server locally:
        </p>
        <code className="block mt-3 p-4 bg-gray-900 text-gray-100 rounded text-sm font-mono">
          npm run dev
        </code>
        <p className="mt-3 text-sm text-yellow-700">
          Then visit <code>http://localhost:3000/admin/freshness</code> for live reports.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Includes:</h3>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-center gap-2">
            <span>📊</span>
            <span>Overall confidence score average</span>
          </li>
          <li className="flex items-center gap-2">
            <span>📅</span>
            <span>Listings by last update date (fresh, aging, stale)</span>
          </li>
          <li className="flex items-center gap-2">
            <span>⚠️</span>
            <span>Expiring soon alerts</span>
          </li>
          <li className="flex items-center gap-2">
            <span>📉</span>
            <span>Lowest confidence listings (needs attention)</span>
          </li>
          <li className="flex items-center gap-2">
            <span>🗂️</span>
            <span>Breakdown by availability status</span>
          </li>
        </ul>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900">View Statistics via CLI</h4>
          <p className="text-sm text-blue-800 mt-1">
            You can also check stats without starting the dev server:
          </p>
          <code className="block mt-2 p-3 bg-gray-900 text-gray-100 rounded text-sm font-mono">
            npx tsx scripts/freshness-stats.ts
          </code>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <Link href="/admin" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
