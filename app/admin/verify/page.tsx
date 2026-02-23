import Link from 'next/link';

export default function VerifyPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Verify Listings</h1>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-yellow-900 mb-2">⚠️ Local Access Required</h2>
        <p className="text-yellow-800">
          Verification requires database access. Run the development server locally:
        </p>
        <code className="block mt-3 p-4 bg-gray-900 text-gray-100 rounded text-sm font-mono">
          npm run dev
        </code>
        <p className="mt-3 text-sm text-yellow-700">
          Then visit <code>http://localhost:3000/admin/verify</code> to verify listings.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-sm font-semibold text-blue-900 mb-2">💡 Verification Tips</h2>
        <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
          <li>Check the original listing source for availability confirmation</li>
          <li>Contact the property manager if needed</li>
          <li>Verify price and fees match the source</li>
          <li>Mark as &quot;Manually Confirmed&quot; to boost confidence to 90%</li>
          <li>Focus on high-traffic listings first (most user impact)</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Queue Shows:</h3>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-center gap-2">
            <span>🔥</span>
            <span>High-traffic listings (prioritized)</span>
          </li>
          <li className="flex items-center gap-2">
            <span>⚠️</span>
            <span>Low confidence listings (&lt;50)</span>
          </li>
          <li className="flex items-center gap-2">
            <span>📅</span>
            <span>Stale listings (14+ days since update)</span>
          </li>
          <li className="flex items-center gap-2">
            <span>❓</span>
            <span>Unverified listings</span>
          </li>
        </ul>
      </div>

      <div className="mt-6 flex gap-4">
        <Link href="/admin" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
