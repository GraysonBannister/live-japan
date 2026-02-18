'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Property } from '../types/property';

// Dynamic import for PropertyMap to avoid SSR issues with Leaflet
const PropertyMap = dynamic(() => import('../components/PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-2">🗺️</div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

interface MapViewClientProps {
  initialProperties: Property[];
}

export default function MapViewClient({ initialProperties }: MapViewClientProps) {
  const [filters, setFilters] = useState({
    area: '',
    minPrice: '',
    maxPrice: '',
    type: '',
    maxWalkTime: '',
    furnished: false,
    foreignerFriendly: false
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load filters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFilters({
      area: params.get('area') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      type: params.get('type') || '',
      maxWalkTime: params.get('maxWalkTime') || '',
      furnished: params.get('furnished') === 'true',
      foreignerFriendly: params.get('foreignerFriendly') === 'true'
    });
  }, []);

  // Listen for filterchange event from SearchFormWrapper
  useEffect(() => {
    const handleFilterChange = () => {
      const params = new URLSearchParams(window.location.search);
      setFilters({
        area: params.get('area') || '',
        minPrice: params.get('minPrice') || '',
        maxPrice: params.get('maxPrice') || '',
        type: params.get('type') || '',
        maxWalkTime: params.get('maxWalkTime') || '',
        furnished: params.get('furnished') === 'true',
        foreignerFriendly: params.get('foreignerFriendly') === 'true'
      });
    };

    window.addEventListener('filterchange', handleFilterChange);
    return () => window.removeEventListener('filterchange', handleFilterChange);
  }, []);

  // Filter properties based on current filters
  const filteredProperties = useMemo(() => {
    return initialProperties.filter(property => {
      // Area filter
      if (filters.area && !property.location.toLowerCase().includes(filters.area.toLowerCase())) {
        return false;
      }

      // Type filter
      if (filters.type && property.type !== filters.type) {
        return false;
      }

      // Price filters
      if (filters.minPrice && property.price < parseInt(filters.minPrice)) {
        return false;
      }
      if (filters.maxPrice && property.price > parseInt(filters.maxPrice)) {
        return false;
      }

      // Max walk time filter
      if (filters.maxWalkTime && property.walkTime > parseInt(filters.maxWalkTime)) {
        return false;
      }

      // Furnished filter
      if (filters.furnished && !property.furnished) {
        return false;
      }

      // Foreigner friendly filter
      if (filters.foreignerFriendly && !property.foreignerFriendly) {
        return false;
      }

      return true;
    });
  }, [initialProperties, filters]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setFilters({ area: '', minPrice: '', maxPrice: '', type: '', maxWalkTime: '', furnished: false, foreignerFriendly: false });
    window.history.pushState({}, '', '/map');
    window.dispatchEvent(new Event('filterchange'));
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'monthly_mansion':
        return 'Monthly Mansion';
      case 'weekly_mansion':
        return 'Weekly Mansion';
      case 'apartment':
        return 'Apartment';
      default:
        return type;
    }
  };

  return (
    <div className="flex h-full">
      {/* Map Container */}
      <div className="flex-1 relative">
        <PropertyMap properties={filteredProperties} />
        
        {/* Results Count Overlay */}
        <div className="absolute top-4 left-4 z-[400] bg-white rounded-lg shadow-lg px-4 py-2">
          <p className="text-sm font-medium text-gray-900">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
          </p>
          {(filters.area || filters.type || filters.minPrice || filters.maxPrice) && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-blue-600 hover:text-blue-800 mt-1"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Toggle Sidebar Button (Mobile) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-4 right-4 z-[400] bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg sm:hidden"
        >
          {isSidebarOpen ? 'Hide List' : 'Show List'}
        </button>

        {/* View Grid Button */}
        <Link
          href="/"
          className="absolute bottom-4 right-4 z-[400] bg-white text-gray-700 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Grid View
        </Link>
      </div>

      {/* Sidebar Property List */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} sm:block w-full sm:w-80 bg-white border-l border-gray-200 overflow-y-auto`}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Properties / 物件一覧</h2>
          <p className="text-sm text-gray-500">{filteredProperties.length} results found</p>
        </div>
        
        <div className="divide-y divide-gray-100">
          {filteredProperties.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-2">🏠</div>
              <p className="text-gray-600">No properties found</p>
              <button
                onClick={handleClearFilters}
                className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear filters
              </button>
            </div>
          ) : (
            filteredProperties.map((property) => (
              <Link
                key={property.id}
                href={`/property/${property.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex gap-3">
                  <img
                    src={property.photos?.[0] || '/placeholder-property.jpg'}
                    alt={property.location}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {property.location}
                    </p>
                    <p className="text-blue-600 font-bold text-sm">
                      {formatPrice(property.price)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {property.nearestStation} • {property.walkTime} min
                    </p>
                    <div className="flex gap-1 mt-1">
                      {property.furnished && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                          Furnished
                        </span>
                      )}
                      {property.foreignerFriendly && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                          Foreigner OK
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
