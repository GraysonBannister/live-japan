'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import PropertyCard from './PropertyCard';
import ViewToggle from './ViewToggle';
import { Property, ViewMode } from '../types/property';

interface PropertyGridProps {
  initialProperties: Property[];
}

// Dynamic import for PropertyMap to avoid SSR issues with Leaflet
const PropertyMap = dynamic(() => import('./PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-xl">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-2">🗺️</div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

export default function PropertyGrid({ initialProperties }: PropertyGridProps) {
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
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredProperties.length} Properties Found / {filteredProperties.length}件の物件
          </h2>
          {filters.area || filters.type || filters.minPrice || filters.maxPrice || filters.maxWalkTime || filters.furnished || filters.foreignerFriendly ? (
            <button
              onClick={handleClearFilters}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-600">Try adjusting your search filters</p>
          <p className="text-gray-500 text-sm mt-1">検索条件を変更してみてください</p>
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
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-100"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 border rounded-md ${
                    currentPage === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <PropertyMap properties={filteredProperties} />
          <p className="text-sm text-gray-500 text-center">
            Showing {filteredProperties.length} properties on map • Click markers to view details
          </p>
        </div>
      )}
    </>
  );
}
