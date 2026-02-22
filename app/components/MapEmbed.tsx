'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

interface MapEmbedProps {
  location: string;
  lat?: number | null;
  lng?: number | null;
}

type AmenityType = 'konbini' | 'supermarket' | 'drugstore' | 'station';

interface AmenityFilter {
  type: AmenityType;
  label: string;
  labelJa: string;
  icon: string;
  color: string;
}

interface AmenityCounts {
  konbini: number;
  supermarket: number;
  drugstore: number;
  station: number;
}

const AMENITIES: AmenityFilter[] = [
  { type: 'konbini', label: 'Konbini', labelJa: 'コンビニ', icon: '🏪', color: 'bg-[#3F51B5]' },
  { type: 'supermarket', label: 'Supermarket', labelJa: 'スーパー', icon: '🛒', color: 'bg-[#6B8E23]' },
  { type: 'drugstore', label: 'Drug Store', labelJa: '薬局', icon: '💊', color: 'bg-[#D84315]' },
  { type: 'station', label: 'Station', labelJa: '駅', icon: '🚉', color: 'bg-[#78716C]' },
];

// Dynamic import of the actual map component to avoid SSR issues
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video rounded-lg bg-[#F5F1E8] border border-[#E7E5E4] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-2">🗺️</div>
        <p className="text-[#78716C]">Loading map...</p>
      </div>
    </div>
  ),
});

export default function MapEmbed({ location, lat, lng }: MapEmbedProps) {
  const [activeFilters, setActiveFilters] = useState<AmenityType[]>([]);
  const [showFilters, setShowFilters] = useState(true); // Show by default
  const [counts, setCounts] = useState<AmenityCounts | null>(null);

  const toggleFilter = (type: AmenityType) => {
    setActiveFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Default to Tokyo if no coords
  const centerLat = lat || 35.6762;
  const centerLng = lng || 139.6503;

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-medium text-[#3F51B5] hover:text-[#283593] transition-colors"
        >
          <span>{showFilters ? '▼' : '▶'}</span>
          <span>Nearby Amenities / 周辺施設</span>
        </button>
        {activeFilters.length > 0 && (
          <span className="text-xs text-[#78716C]">
            {activeFilters.length} selected / {activeFilters.length}件選択中
          </span>
        )}
      </div>

      {/* Filter Buttons with counts */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 p-4 bg-[#F5F1E8] rounded-lg">
          {AMENITIES.map((amenity) => {
            const count = counts?.[amenity.type] ?? 0;
            return (
              <button
                key={amenity.type}
                onClick={() => toggleFilter(amenity.type)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilters.includes(amenity.type)
                    ? `${amenity.color} text-white shadow-sm`
                    : 'bg-white text-[#2C2416] border border-[#E7E5E4] hover:border-[#A8A29E]'
                }`}
              >
                <span>{amenity.icon}</span>
                <span className="hidden sm:inline">{amenity.label}</span>
                <span className="sm:hidden">{amenity.labelJa}</span>
                {count > 0 && (
                  <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                    activeFilters.includes(amenity.type) 
                      ? 'bg-white/30' 
                      : 'bg-[#E7E5E4] text-[#57534E]'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
          {activeFilters.length > 0 && (
            <button
              onClick={() => setActiveFilters([])}
              className="px-3 py-2 text-sm text-[#78716C] hover:text-[#2C2416] transition-colors"
            >
              Clear / クリア
            </button>
          )}
        </div>
      )}

      {/* Legend showing all available */}
      {counts && !showFilters && (
        <div className="flex flex-wrap gap-3 text-xs text-[#78716C]">
          <span>Within 1km / 1km圏内:</span>
          <span>🏪 {counts.konbini} konbini</span>
          <span>🛒 {counts.supermarket} supermarkets</span>
          <span>💊 {counts.drugstore} drugstores</span>
          <span>🚉 {counts.station} stations</span>
        </div>
      )}

      {/* Leaflet Map - Dynamically imported */}
      <LeafletMap 
        lat={centerLat} 
        lng={centerLng} 
        location={location}
        activeFilters={activeFilters}
        onCountsLoaded={setCounts}
      />

      {/* Legend */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-3 text-xs text-[#78716C]">
          <span>Showing / 表示中:</span>
          {activeFilters.map(type => {
            const amenity = AMENITIES.find(a => a.type === type)!;
            return (
              <span key={type} className="flex items-center gap-1">
                <span>{amenity.icon}</span>
                <span>{amenity.labelJa}</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
