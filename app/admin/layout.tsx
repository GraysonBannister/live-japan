// Admin layout - static export compatible
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/listings', label: 'Listings', icon: '🏠' },
  { href: '/admin/freshness', label: 'Freshness', icon: '⏱️' },
  { href: '/admin/verify', label: 'Verify', icon: '✓' },
  { href: '/admin/translate', label: 'Translate', icon: '🌐' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold">🏠 Live Japan Admin</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/en" 
                target="_blank"
                className="text-sm text-gray-300 hover:text-white"
              >
                View Site →
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-64px)] bg-white border-r border-gray-200">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <p className="font-medium text-gray-700 mb-1">Quick Actions</p>
              <button
                onClick={() => window.location.href = '/admin/run-ingest'}
                className="w-full mt-2 px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700"
              >
                🔄 Run Scraper
              </button>
              <button
                onClick={() => window.location.href = '/admin/run-freshness'}
                className="w-full mt-2 px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                ⏱️ Daily Freshness
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
