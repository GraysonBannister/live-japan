'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

interface AmenityLocation {
  type: AmenityType;
  name: string;
  lat: number;
  lng: number;
}

const AMENITIES: AmenityFilter[] = [
  { type: 'konbini', label: 'Konbini', labelJa: 'コンビニ', icon: '🏪', color: 'bg-[#3F51B5]' },
  { type: 'supermarket', label: 'Supermarket', labelJa: 'スーパー', icon: '🛒', color: 'bg-[#6B8E23]' },
  { type: 'drugstore', label: 'Drug Store', labelJa: '薬局', icon: '💊', color: 'bg-[#D84315]' },
  { type: 'station', label: 'Station', labelJa: '駅', icon: '🚉', color: 'bg-[#78716C]' },
];

// Create custom icons
const createPropertyIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: #D84315;
      color: white;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 700;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      white-space: nowrap;
    ">🏠 Property</div>`,
    iconSize: [100, 40],
    iconAnchor: [50, 20],
  });
};

const createAmenityIcon = (type: AmenityType) => {
  const colors: Record<AmenityType, string> = {
    konbini: '#3F51B5',
    supermarket: '#6B8E23',
    drugstore: '#D84315',
    station: '#78716C',
  };
  
  const icons: Record<AmenityType, string> = {
    konbini: '🏪',
    supermarket: '🛒',
    drugstore: '💊',
    station: '🚉',
  };
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${colors[type]};
      color: white;
      padding: 6px 10px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      white-space: nowrap;
    ">${icons[type]}</div>`,
    iconSize: [60, 32],
    iconAnchor: [30, 16],
  });
};

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Map bounds fitter - keeps property centered
function MapController({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([lat, lng], 16); // Fixed zoom level 16
  }, [map, lat, lng]);
  
  return null;
}

// Mock nearby amenities data - in production this would come from an API
const getMockAmenities = (centerLat: number, centerLng: number): AmenityLocation[] => {
  // Generate some mock amenities around the property
  // In production, this would fetch from Google Places API or similar
  const amenities: AmenityLocation[] = [];
  
  // Add a convenience store ~100m north
  amenities.push({
    type: 'konbini',
    name: '7-Eleven / セブンイレブン',
    lat: centerLat + 0.001,
    lng: centerLng,
  });
  
  // Add a station ~200m east
  amenities.push({
    type: 'station',
    name: 'Nearby Station / 最寄駅',
    lat: centerLat,
    lng: centerLng + 0.002,
  });
  
  // Add a supermarket ~150m south
  amenities.push({
    type: 'supermarket',
    name: 'Supermarket / スーパー',
    lat: centerLat - 0.0015,
    lng: centerLng,
  });
  
  // Add a drugstore ~120m west
  amenities.push({
    type: 'drugstore',
    name: 'Drug Store / 薬局',
    lat: centerLat,
    lng: centerLng - 0.0012,
  });
  
  return amenities;
};

export default function MapEmbed({ location, lat, lng }: MapEmbedProps) {
  const [activeFilters, setActiveFilters] = useState<AmenityType[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [amenities, setAmenities] = useState<AmenityLocation[]>([]);

  // Generate mock amenities when coords are available
  useEffect(() => {
    if (lat && lng) {
      setAmenities(getMockAmenities(lat, lng));
    }
  }, [lat, lng]);

  const toggleFilter = (type: AmenityType) => {
    setActiveFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const filteredAmenities = amenities.filter(a => activeFilters.includes(a.type));

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

      {/* Leaflet Map */}
      <div className="w-full aspect-video rounded-lg overflow-hidden border border-[#E7E5E4]">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={16}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', minHeight: '400px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController lat={centerLat} lng={centerLng} />
          
          {/* Property Marker - Always shown */}
          <Marker 
            position={[centerLat, centerLng]} 
            icon={createPropertyIcon()}
          >
            <Popup>
              <div className="font-medium">{location}</div>
            </Popup>
          </Marker>
          
          {/* Amenity Markers - Only shown when filters active */}
          {filteredAmenities.map((amenity, index) => (
            <Marker
              key={`${amenity.type}-${index}`}
              position={[amenity.lat, amenity.lng]}
              icon={createAmenityIcon(amenity.type)}
            >
              <Popup>
                <div className="font-medium">{amenity.name}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
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

      {/* Note about mock data */}
      <p className="text-xs text-[#A8A29E]">
        💡 Showing approximate nearby locations. Click filters to see different amenities.
        / おおよその周辺施設を表示しています。フィルターをクリックして施設を切り替えてください。
      </p>
    </div>
  );
}
