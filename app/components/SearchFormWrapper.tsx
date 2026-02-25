'use client';

import { useState, useEffect } from 'react';
import SearchForm, { SearchFilters } from './SearchForm';

export default function SearchFormWrapper() {
  const [filters, setFilters] = useState<SearchFilters>({
    area: '',
    minPrice: '',
    maxPrice: '',
    type: '',
    maxWalkTime: '',
    furnished: false,
    foreignerFriendly: false,
    minRooms: '',
    maxRooms: '',
    minSize: '',
    maxSize: '',
    sizeUnit: 'sqm'
  });

  // Load initial filters from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setFilters({
        area: params.get('area') || '',
        minPrice: params.get('minPrice') || '',
        maxPrice: params.get('maxPrice') || '',
        type: params.get('type') || '',
        maxWalkTime: params.get('maxWalkTime') || '',
        furnished: params.get('furnished') === 'true',
        foreignerFriendly: params.get('foreignerFriendly') === 'true',
        minRooms: params.get('minRooms') || '',
        maxRooms: params.get('maxRooms') || '',
        minSize: params.get('minSize') || '',
        maxSize: params.get('maxSize') || '',
        sizeUnit: (params.get('sizeUnit') as 'sqm' | 'sqft') || 'sqm'
      });
    }
  }, []);

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);

    // Get current URL params to preserve view mode
    const currentParams = new URLSearchParams(window.location.search);
    const currentView = currentParams.get('view');
    const isMapPage = window.location.pathname === '/map';

    // Build query string and update URL without navigation
    const params = new URLSearchParams();
    if (newFilters.area) params.set('area', newFilters.area);
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
    if (newFilters.type) params.set('type', newFilters.type);
    if (newFilters.maxWalkTime) params.set('maxWalkTime', newFilters.maxWalkTime);
    if (newFilters.furnished) params.set('furnished', 'true');
    if (newFilters.foreignerFriendly) params.set('foreignerFriendly', 'true');
    if (newFilters.minRooms) params.set('minRooms', newFilters.minRooms);
    if (newFilters.maxRooms) params.set('maxRooms', newFilters.maxRooms);
    if (newFilters.minSize) params.set('minSize', newFilters.minSize);
    if (newFilters.maxSize) params.set('maxSize', newFilters.maxSize);
    if (newFilters.sizeUnit !== 'sqm') params.set('sizeUnit', newFilters.sizeUnit);
    
    // Preserve view parameter on main page
    if (currentView && !isMapPage) {
      params.set('view', currentView);
    }

    const queryString = params.toString();
    const basePath = isMapPage ? '/map' : '/';
    const newUrl = queryString ? `${basePath}?${queryString}` : basePath;
    window.history.pushState({}, '', newUrl);

    // Trigger a custom event that PropertyGrid can listen to
    window.dispatchEvent(new Event('filterchange'));
  };

  return <SearchForm onSearch={handleSearch} initialFilters={filters} />;
}
