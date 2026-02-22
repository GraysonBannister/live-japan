import { prisma } from '../lib/prisma';
import SearchFormWrapper from '../components/SearchFormWrapper';
import MapViewClient from '../components/MapViewClient';
import { Property } from '../types/property';

export const metadata = {
  title: 'Property Map | Live Japan',
  description: 'Browse all available properties on an interactive map. Find your perfect home in Japan with our map view.',
};

// Force static generation at build time
export const dynamic = 'force-static';

async function getProperties(): Promise<Property[]> {
  const properties = await prisma.property.findMany({
    orderBy: {
      id: 'desc'
    }
  });

  return properties as Property[];
}

export default async function MapPage() {
  const properties = await getProperties();

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Header */}
      <header className="bg-[#FDFBF7] shadow-sm sticky top-0 z-20 border-b border-[#E7E5E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-[#3F51B5] hover:text-[#283593]">
            ← Live Japan
          </a>
          <h1 className="text-lg font-semibold text-[#2C2416] hidden sm:block">
            Property Map / 物件マップ
          </h1>
          <nav className="hidden sm:flex gap-6 text-sm text-[#78716C]">
            <span>English</span>
            <span>/</span>
            <span className="text-[#A8A29E]">日本語</span>
          </nav>
        </div>
      </header>

      {/* Search Section */}
      <div className="bg-[#FDFBF7] border-b border-[#E7E5E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SearchFormWrapper />
        </div>
      </div>

      {/* Map Section */}
      <main className="h-[calc(100vh-180px)]">
        <MapViewClient initialProperties={properties} />
      </main>

      {/* Footer */}
      <footer className="bg-[#2C2416] text-[#A8A29E] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>&copy; 2025 Live Japan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
