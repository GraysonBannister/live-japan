import { getPropertiesFromSupabase } from '../lib/supabase-data';
import Header from '../components/Header';
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
  return getPropertiesFromSupabase();
}

export default async function MapPage() {
  const properties = await getProperties();

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />

      {/* Search Section */}
      <div className="bg-[#FDFBF7] border-b border-[#E7E5E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-lg font-semibold text-[#2C2416] mb-4">
            Property Map / 物件マップ
          </h1>
          <SearchFormWrapper />
        </div>
      </div>

      {/* Map Section */}
      <main className="h-[calc(100vh-220px)]">
        <MapViewClient initialProperties={properties} />
      </main>

      {/* Footer */}
      <footer className="bg-[#2C2416] text-[#A8A29E] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>&copy; 2026 Live Japan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
