import Link from 'next/link';

export default function TranslatePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Auto-Translate Listings</h1>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-yellow-900 mb-2">⚠️ Local Execution Required</h2>
        <p className="text-yellow-800">
          Translation requires DeepL API access and database connection. Run locally:
        </p>
        <code className="block mt-3 p-4 bg-gray-900 text-gray-100 rounded text-sm font-mono">
          export DEEPL_API_KEY=&quot;your-api-key&quot;<br/>
          npx tsx scripts/translate-listings.ts
        </code>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Setup Instructions</h3>
        <ol className="space-y-3 text-gray-700 list-decimal list-inside">
          <li>
            <strong>Get a free DeepL API key:</strong>
            <ul className="ml-6 mt-1 space-y-1 text-sm">
              <li>Visit <a href="https://www.deepl.com/pro-api" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">deepl.com/pro-api</a></li>
              <li>Sign up for a free account (500,000 characters/month)</li>
              <li>Copy your API key from the account settings</li>
            </ul>
          </li>
          <li>
            <strong>Set the environment variable:</strong>
            <code className="block mt-1 p-2 bg-gray-100 rounded text-sm">
              export DEEPL_API_KEY=&quot;your-key-here&quot;
            </code>
          </li>
          <li>
            <strong>Run the translation script:</strong>
            <code className="block mt-1 p-2 bg-gray-100 rounded text-sm">
              npx tsx scripts/translate-listings.ts
            </code>
          </li>
          <li>
            <strong>Commit and push changes:</strong>
            <code className="block mt-1 p-2 bg-gray-100 rounded text-sm">
              git add dev.db<br/>
              git commit -m &quot;data: auto-translate Japanese descriptions&quot;<br/>
              git push
            </code>
          </li>
        </ol>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900">💡 Pro Tip: Auto-translate during scraping</h4>
          <p className="text-sm text-blue-800 mt-1">
            Set DEEPL_API_KEY before running the scraper, and new listings will be auto-translated:
          </p>
          <code className="block mt-2 p-3 bg-gray-900 text-gray-100 rounded text-sm font-mono">
            export DEEPL_API_KEY=&quot;your-key&quot;<br/>
            npm run ingest
          </code>
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900">✓ Free Tier Limits</h4>
          <p className="text-sm text-green-800 mt-1">
            DeepL free tier includes 500,000 characters/month. Typical property description: ~200-500 characters.
            You can translate ~1,000-2,500 listings per month for free.
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <Link href="/admin" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
          Back to Dashboard
        </Link>
        <Link href="/admin/listings" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          View Listings
        </Link>
      </div>
    </div>
  );
}
