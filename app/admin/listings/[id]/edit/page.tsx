import Link from 'next/link';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default function EditListingPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/listings"
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-yellow-900 mb-2">⚠️ Local Access Required</h2>
        <p className="text-yellow-800">
          Editing listings requires database access. Run the development server locally:
        </p>
        <code className="block mt-3 p-4 bg-gray-900 text-gray-100 rounded text-sm font-mono">
          npm run dev
        </code>
        <p className="mt-3 text-sm text-yellow-700">
          Then visit <code>http://localhost:3000/admin/listings</code> to edit listings.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Editable Fields:</h3>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-center gap-2">
            <span>💰</span>
            <span>Price, deposit, key money</span>
          </li>
          <li className="flex items-center gap-2">
            <span>📍</span>
            <span>Location, nearest station, walk time</span>
          </li>
          <li className="flex items-center gap-2">
            <span>📝</span>
            <span>Description (English & Japanese)</span>
          </li>
          <li className="flex items-center gap-2">
            <span>👁️</span>
            <span>Active/hidden status</span>
          </li>
          <li className="flex items-center gap-2">
            <span>✓</span>
            <span>Verification status</span>
          </li>
          <li className="flex items-center gap-2">
            <span>🏠</span>
            <span>Furnished, foreigner friendly flags</span>
          </li>
        </ul>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900">Alternative: Prisma Studio</h4>
          <p className="text-sm text-blue-800 mt-1">
            For direct database editing, use Prisma Studio:
          </p>
          <code className="block mt-2 p-3 bg-gray-900 text-gray-100 rounded text-sm font-mono">
            npx prisma studio
          </code>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <Link href="/admin/listings" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
          Back to Listings
        </Link>
      </div>
    </div>
  );
}
