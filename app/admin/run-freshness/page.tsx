import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function RunFreshnessPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Run Daily Freshness Check</h1>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-yellow-900 mb-2">⚠️ Local Execution Required</h2>
        <p className="text-yellow-800">
          The freshness check requires server-side database access. 
          Run this command locally:
        </p>
        <code className="block mt-3 p-4 bg-gray-900 text-gray-100 rounded text-sm font-mono">
          npx tsx scripts/daily-freshness.ts
        </code>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What this script does:</h3>
        <ul className="space-y-2 text-gray-700 list-disc list-inside">
          <li>Hides listings that have passed their auto-hide date</li>
          <li>Updates confidence scores for all active listings</li>
          <li>Flags listings not seen in 30+ days as probably unavailable</li>
          <li>Logs summary of actions taken</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-4">After running:</h3>
        <ol className="space-y-2 text-gray-700 list-decimal list-inside">
          <li>Check the output for hidden/updated listings</li>
          <li>Commit the updated <code>dev.db</code> file</li>
          <li>Push to deploy changes to the site</li>
        </ol>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900">View Statistics</h4>
          <p className="text-sm text-blue-800 mt-1">
            To see current freshness stats without modifying data:
          </p>
          <code className="block mt-2 p-3 bg-gray-900 text-gray-100 rounded text-sm font-mono">
            npx tsx scripts/freshness-stats.ts
          </code>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <Link
          href="/admin"
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Back to Dashboard
        </Link>
        <Link
          href="/admin/freshness"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          View Freshness Report
        </Link>
      </div>
    </div>
  );
}
