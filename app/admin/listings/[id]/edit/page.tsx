import { prisma } from '../../../../lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getListing(id: string) {
  const listing = await prisma.property.findUnique({
    where: { id: parseInt(id) },
  });

  if (!listing) {
    notFound();
  }

  return listing;
}

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params;
  const listing = await getListing(id);

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

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-yellow-800">
          <strong>Note:</strong> Editing requires server-side processing. 
          Run this command locally to edit listings:
        </p>
        <code className="block mt-2 p-3 bg-gray-900 text-gray-100 rounded text-sm">
          npx prisma studio
        </code>
        <p className="mt-2 text-sm text-yellow-700">
          Or use the freshness scripts to batch update listings.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              External ID
            </label>
            <input
              type="text"
              value={listing.externalId || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={listing.location}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nearest Station
            </label>
            <input
              type="text"
              value={listing.nearestStation}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (¥/month)
            </label>
            <input
              type="text"
              value={`¥${listing.price.toLocaleString()}`}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Status:</span>
              <span className={`ml-2 font-medium ${listing.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                {listing.isActive ? 'Active' : 'Hidden'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Confidence:</span>
              <span className="ml-2 font-medium">{listing.statusConfidenceScore}/100</span>
            </div>
            <div>
              <span className="text-gray-500">Availability:</span>
              <span className="ml-2 font-medium">{listing.availabilityStatus}</span>
            </div>
            <div>
              <span className="text-gray-500">Verification:</span>
              <span className="ml-2 font-medium">{listing.verificationStatus}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Freshness Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <span className="text-gray-500">Last Scraped:</span>
              <span className="ml-2 font-medium">
                {listing.lastScrapedAt?.toLocaleDateString() || 'Never'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Auto-hide After:</span>
              <span className="ml-2 font-medium">
                {listing.autoHideAfter?.toLocaleDateString() || 'Not set'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Content Hash:</span>
              <span className="ml-2 font-medium truncate">
                {listing.contentHash?.substring(0, 8) || 'None'}...
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 mt-6 flex justify-end gap-4">
          <Link
            href="/admin/listings"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back to Listings
          </Link>
          <Link
            href={`/property/${listing.id}`}
            target="_blank"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View on Site
          </Link>
        </div>
      </div>
    </div>
  );
}
