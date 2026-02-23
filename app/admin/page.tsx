import Link from 'next/link';

// Stats are fetched client-side or shown as placeholders for static build
export default function AdminDashboard() {
  // For static export, show placeholder stats
  // When running locally, these would be fetched from the database
  const stats = {
    totalActive: '—',
    totalHidden: '—',
    avgConfidence: '—',
    recentlyUpdated: '—',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-yellow-800">
          <strong>Note:</strong> Admin features require local database access. 
          Run <code className="bg-gray-900 text-gray-100 px-2 py-1 rounded text-sm">npm run dev</code> locally to see live stats.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Active Listings" value={stats.totalActive} subtitle="Currently visible" color="blue" />
        <StatCard title="Hidden Listings" value={stats.totalHidden} subtitle="Auto or manually hidden" color="gray" />
        <StatCard title="Avg Confidence" value={stats.avgConfidence} subtitle="Overall listing quality" color="yellow" />
        <StatCard title="Recently Updated" value={stats.recentlyUpdated} subtitle="Last 7 days" color="green" />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickLinkCard
          title="Manage Listings"
          description="View, edit, and manage all property listings"
          href="/admin/listings"
          icon="🏠"
        />
        <QuickLinkCard
          title="Freshness Report"
          description="Check listing freshness and health metrics"
          href="/admin/freshness"
          icon="⏱️"
        />
        <QuickLinkCard
          title="Verify Listings"
          description="Manually verify high-priority listings"
          href="/admin/verify"
          icon="✓"
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, color }: { title: string; value: string | number; subtitle: string; color: 'blue' | 'green' | 'yellow' | 'red' | 'gray' }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200',
    gray: 'bg-gray-50 border-gray-200',
  };

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]}`}>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}

function QuickLinkCard({ title, description, href, icon }: { title: string; description: string; href: string; icon: string }) {
  return (
    <Link href={href} className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </Link>
  );
}
