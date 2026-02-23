import Link from 'next/link';

export default function AdminListingsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Listings Management</h1>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-yellow-900 mb-2">⚠️ Local Access Required</h2>
        <p className="text-yellow-800">
          Listing management requires database access. Run the development server locally:
        </p>
        <code className="block mt-3 p-4 bg-gray-900 text-gray-100 rounded text-sm font-mono">
          npm run dev
        </code>
        <p className="mt-3 text-sm text-yellow-700">
          Then visit <code>http://localhost:3000/admin/listings</code> to manage listings.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Actions (Local Only)</h3>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-center gap-2">
            <span>🏠</span>
            <span>View all listings with filters (active, hidden, stale, etc.)</span>
          </li>
          <li className="flex items-center gap-2">
            <span>✏️</span>
            <span>Edit listing details (price, status, description)</span>
          </li>
          <li className="flex items-center gap-2">
            <span>👁️</span>
            <span>Toggle listing visibility (active/hidden)</span>
          </li>
          <li className="flex items-center gap-2">
            <span>✓</span>
            <span>Mark listings as manually verified</span>
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
