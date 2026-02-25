'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import PropertyCard from './PropertyCard';
import ViewToggle from './ViewToggle';
import { Property, ViewMode } from '../types/property';
import { useCurrency } from './CurrencyProvider';
import { convertCurrency } from '../lib/currency';

interface PropertyGridProps {
  initialProperties: Property[];
}

// Dynamic import for PropertyMap to avoid SSR issues with Leaflet
const PropertyMap = dynamic(() => import('./PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-[#F5F1E8] rounded-xl">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-2">🗺️</div>
        <p className="text-[#78716C]">Loading map...</p>
      </div>
    </div>
  ),
});

export default function PropertyGrid({ initialProperties }: PropertyGridProps) {
  const currencyContext = useCurrency();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState({
    area: '',
    minPrice: '',
    maxPrice: '',
    type: '',
    maxWalkTime: '',
    furnished: false,
    foreignerFriendly: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Load filters and page from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as ViewMode;
    if (viewParam === 'map' || viewParam === 'grid') {
      setViewMode(viewParam);
    }
    
    setFilters({
      area: params.get('area') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      type: params.get('type') || '',
      maxWalkTime: params.get('maxWalkTime') || '',
      furnished: params.get('furnished') === 'true',
      foreignerFriendly: params.get('foreignerFriendly') === 'true'
    });

    const pageParam = parseInt(params.get('page') || '1', 10);
    setCurrentPage(isNaN(pageParam) ? 1 : pageParam);
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
      setCurrentPage(1); // Reset to page 1 on filter change
    };

    window.addEventListener('filterchange', handleFilterChange);
    return () => window.removeEventListener('filterchange', handleFilterChange);
  }, []);

  // Filter properties based on current filters
  const filteredProperties = useMemo(() => {
    return initialProperties.filter(property => {
      // Area filter - handle "All {Region}" selections by matching just the region name
      if (filters.area) {
        const searchTerm = filters.area.toLowerCase().trim();
        const locationLower = property.location?.toLowerCase() || '';
        
        // If searching for "All {Region}", match any location containing that region
        if (searchTerm.startsWith('all ')) {
          const regionName = searchTerm.replace('all ', '').trim();
          // Check if location contains the region name (e.g., "All Osaka" matches "Namba, Osaka" or "Osaka City")
          const matches = locationLower.includes(regionName) || 
                         // Also check for Japanese prefecture names that might be in location
                         (regionName === 'tokyo' && (locationLower.includes('tokyo') || locationLower.includes('東京'))) ||
                         (regionName === 'osaka' && (locationLower.includes('osaka') || locationLower.includes('大阪'))) ||
                         (regionName === 'kyoto' && (locationLower.includes('kyoto') || locationLower.includes('京都'))) ||
                         (regionName === 'kanagawa' && (locationLower.includes('kanagawa') || locationLower.includes('神奈川'))) ||
                         (regionName === 'chiba' && (locationLower.includes('chiba') || locationLower.includes('千葉'))) ||
                         (regionName === 'saitama' && (locationLower.includes('saitama') || locationLower.includes('埼玉'))) ||
                         (regionName === 'hyogo' && (locationLower.includes('hyogo') || locationLower.includes('兵庫'))) ||
                         (regionName === 'fukuoka' && (locationLower.includes('fukuoka') || locationLower.includes('福岡'))) ||
                         (regionName === 'hokkaido' && (locationLower.includes('hokkaido') || locationLower.includes('北海道'))) ||
                         (regionName === 'aichi' && (locationLower.includes('aichi') || locationLower.includes('愛知'))) ||
                         (regionName === 'hiroshima' && (locationLower.includes('hiroshima') || locationLower.includes('広島'))) ||
                         (regionName === 'miyagi' && (locationLower.includes('miyagi') || locationLower.includes('宮城'))) ||
                         (regionName === 'okinawa' && (locationLower.includes('okinawa') || locationLower.includes('沖縄')));
          if (!matches) {
            return false;
          }
        } else if (!locationLower.includes(searchTerm)) {
          return false;
        }
      }

      // Type filter
      if (filters.type && property.type !== filters.type) {
        return false;
      }

      // Price filters - convert from user's currency to JPY for comparison
      // Property prices are always stored in JPY
      const currency = currencyContext?.currency || 'JPY';
      const exchangeRates = currencyContext?.exchangeRates;
      
      if (filters.minPrice) {
        const minPriceInput = parseInt(filters.minPrice);
        const minPriceJPY = currency !== 'JPY' && exchangeRates
          ? Math.round(convertCurrency(minPriceInput, currency, 'JPY', { base: currency, date: new Date().toISOString(), rates: exchangeRates.rates }))
          : minPriceInput;
        if (property.price < minPriceJPY) {
          return false;
        }
      }
      
      if (filters.maxPrice) {
        const maxPriceInput = parseInt(filters.maxPrice);
        const maxPriceJPY = currency !== 'JPY' && exchangeRates
          ? Math.round(convertCurrency(maxPriceInput, currency, 'JPY', { base: currency, date: new Date().toISOString(), rates: exchangeRates.rates }))
          : maxPriceInput;
        if (property.price > maxPriceJPY) {
          return false;
        }
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const currentProperties = useMemo(() => {
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    return filteredProperties.slice(indexOfFirst, indexOfLast);
  }, [filteredProperties, currentPage, itemsPerPage]);

  // Adjust page if out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Handle view mode change
  const handleViewChange = useCallback((newView: ViewMode) => {
    setViewMode(newView);
    
    // Update URL with view parameter, preserve page if grid
    const params = new URLSearchParams(window.location.search);
    params.set('view', newView);
    if (newView !== 'grid') {
      params.delete('page');
    }
    
    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : '/';
    window.history.pushState({}, '', newUrl);
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    
    const params = new URLSearchParams(window.location.search);
    params.set('page', page.toString());
    
    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : '/';
    window.history.pushState({}, '', newUrl);
  }, [totalPages]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setFilters({ area: '', minPrice: '', maxPrice: '', type: '', maxWalkTime: '', furnished: false, foreignerFriendly: false });
    setCurrentPage(1);
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('filterchange'));
  }, []);

  return (
    <>
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-[#2C2416]">
            {filteredProperties.length} Properties Found / {filteredProperties.length}件の物件
          </h2>
          {filters.area || filters.type || filters.minPrice || filters.maxPrice || filters.maxWalkTime || filters.furnished || filters.foreignerFriendly ? (
            <button
              onClick={handleClearFilters}
              className="text-[#3F51B5] hover:text-[#283593] text-sm font-medium"
            >
              Clear filters / フィルターをクリア
            </button>
          ) : null}
        </div>
        <ViewToggle 
          currentView={viewMode} 
          onViewChange={handleViewChange}
          propertyCount={filteredProperties.length}
        />
      </div>

      {/* Content */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold text-[#2C2416] mb-2">No properties found</h3>
          <p className="text-[#78716C]">Try adjusting your search filters</p>
          <p className="text-[#A8A29E] text-sm mt-1">検索条件を変更してみてください</p>
        </div>
      ) : viewMode === 'grid' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 sm:gap-2 mt-8 flex-wrap">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 sm:px-4 py-2 text-sm border border-[#E7E5E4] rounded-md disabled:opacity-50 hover:bg-[#F5F1E8] text-[#2C2416]"
              >
                ← <span className="hidden sm:inline">Previous</span>
              </button>
              
              {/* Mobile: Show only current, prev, next page numbers + first/last */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* First page + ellipsis if needed */}
                {currentPage > 2 && (
                  <>
                    <button
                      onClick={() => handlePageChange(1)}
                      className="w-8 h-8 sm:w-10 sm:h-10 text-sm border border-[#E7E5E4] rounded-md hover:bg-[#F5F1E8] flex items-center justify-center text-[#2C2416]"
                    >
                      1
                    </button>
                    {currentPage > 3 && (
                      <span className="px-1 text-[#A8A29E]">...</span>
                    )}
                  </>
                )}
                
                {/* Previous page */}
                {currentPage > 1 && (
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="w-8 h-8 sm:w-10 sm:h-10 text-sm border border-[#E7E5E4] rounded-md hover:bg-[#F5F1E8] flex items-center justify-center text-[#2C2416]"
                  >
                    {currentPage - 1}
                  </button>
                )}
                
                {/* Current page */}
                <button
                  className="w-8 h-8 sm:w-10 sm:h-10 text-sm border border-[#3F51B5] rounded-md bg-[#3F51B5] text-white flex items-center justify-center font-medium"
                >
                  {currentPage}
                </button>
                
                {/* Next page */}
                {currentPage < totalPages && (
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="w-8 h-8 sm:w-10 sm:h-10 text-sm border border-[#E7E5E4] rounded-md hover:bg-[#F5F1E8] flex items-center justify-center text-[#2C2416]"
                  >
                    {currentPage + 1}
                  </button>
                )}
                
                {/* Last page + ellipsis if needed */}
                {currentPage < totalPages - 1 && (
                  <>
                    {currentPage < totalPages - 2 && (
                      <span className="px-1 text-[#A8A29E]">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="w-8 h-8 sm:w-10 sm:h-10 text-sm border border-[#E7E5E4] rounded-md hover:bg-[#F5F1E8] flex items-center justify-center text-[#2C2416]"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 sm:px-4 py-2 text-sm border border-[#E7E5E4] rounded-md disabled:opacity-50 hover:bg-[#F5F1E8] text-[#2C2416]"
              >
                <span className="hidden sm:inline">Next</span> →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <PropertyMap properties={filteredProperties} />
          <p className="text-sm text-[#78716C] text-center">
            Showing {filteredProperties.length} properties on map • Click markers to view details
          </p>
        </div>
      )}
    </>
  );
}
