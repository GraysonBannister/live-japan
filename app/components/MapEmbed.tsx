'use client';

import { useEffect, useState } from 'react';

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

const AMENITIES: AmenityFilter[] = [
  { type: 'konbini', label: 'Konbini', labelJa: 'コンビニ', icon: '🏪', color: 'bg-[#3F51B5]' },
  { type: 'supermarket', label: 'Supermarket', labelJa: 'スーパー', icon: '🛒', color: 'bg-[#6B8E23]' },
  { type: 'drugstore', label: 'Drug Store', labelJa: '薬局', icon: '💊', color: 'bg-[#D84315]' },
  { type: 'station', label: 'Station', labelJa: '駅', icon: '🚉', color: 'bg-[#78716C]' },
];

export default function MapEmbed({ location, lat, lng }: MapEmbedProps) {
  const [mapUrl, setMapUrl] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<AmenityType[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    generateMapUrl();
  }, [location, lat, lng, activeFilters]);

  const generateMapUrl = () => {
    let baseUrl = '';
    
    // If we have coordinates, use them
    if (lat && lng) {
      const coordQuery = `${lat},${lng}`;
      
      if (activeFilters.length > 0) {
        // Show nearby amenities
        const amenities = activeFilters.map(f => {
          switch(f) {
            case 'konbini': return 'convenience store';
            case 'supermarket': return 'supermarket';
            case 'drugstore': return 'drugstore|pharmacy';
            case 'station': return 'train station';
            default: return '';
          }
        }).join('|');
        
        // Search for amenities near the location
        baseUrl = `https://www.google.com/maps?q=${encodeURIComponent(amenities)}&near=${coordQuery}&output=embed`;
      } else {
        // Just show the property location
        baseUrl = `https://www.google.com/maps?q=${coordQuery}&output=embed`;
      }
    } else {
      // Fallback: Use the location string
      let searchQuery = location;
      
      if (!location.includes('Tokyo') && !location.includes('東京都')) {
        if (location.match(/(区|市)$/)) {
          searchQuery = `${location}, Tokyo, Japan`;
        } else {
          searchQuery = `${location}, Tokyo, Japan`;
        }
      }
      
      if (activeFilters.length > 0) {
        const amenities = activeFilters.map(f => {
          switch(f) {
            case 'konbini': return 'convenience store';
            case 'supermarket': return 'supermarket';
            case 'drugstore': return 'drugstore';
            case 'station': return 'train station';
            default: return '';
          }
        }).join(' ');
        
        baseUrl = `https://www.google.com/maps?q=${encodeURIComponent(amenities)}+near+${encodeURIComponent(searchQuery)}&output=embed`;
      } else {
        baseUrl = `https://www.google.com/maps?q=${encodeURIComponent(searchQuery)}&output=embed`;
      }
    }
    
    setMapUrl(baseUrl);
  };

  const toggleFilter = (type: AmenityType) => {
    setActiveFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  if (error) {
    return (
      <div className="w-full aspect-video rounded-lg bg-[#F5F1E8] border border-[#E7E5E4] flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-[#78716C] mb-2">📍 {location}</p>
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location + ', Tokyo, Japan')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3F51B5] hover:text-[#283593] text-sm"
          >
            View on Google Maps →
          </a>
        </div>
      </div>
    );
  }

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

      {/* Filter Buttons */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 p-4 bg-[#F5F1E8] rounded-lg">
          {AMENITIES.map((amenity) => (
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
            </button>
          ))}
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

      {/* Map */}
      <div className="w-full aspect-video rounded-lg overflow-hidden bg-[#F5F1E8] border border-[#E7E5E4]">
        {mapUrl && (
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: '400px' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Map of ${location}`}
            className="w-full h-full"
            onError={() => setError(true)}
          />
        )}
      </div>

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
