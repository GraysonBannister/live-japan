'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type AmenityType = 'konbini' | 'supermarket' | 'drugstore' | 'station';

interface AmenityCounts {
  konbini: number;
  supermarket: number;
  drugstore: number;
  station: number;
}

interface LeafletMapProps {
  lat: number;
  lng: number;
  location: string;
  activeFilters: AmenityType[];
  onCountsLoaded?: (counts: AmenityCounts) => void;
}

interface AmenityLocation {
  type: AmenityType;
  name: string;
  lat: number;
  lng: number;
  distance: number; // in meters
}

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

// Map controller - keeps property centered
function MapController({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([lat, lng], 16);
  }, [map, lat, lng]);
  
  return null;
}

// Calculate distance between two points in meters
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Fetch amenities from OpenStreetMap Overpass API
async function fetchAmenities(lat: number, lng: number, radius: number = 1000): Promise<AmenityLocation[]> {
  const amenities: AmenityLocation[] = [];
  
  // Overpass API query for different amenities
  const query = `
    [out:json][timeout:25];
    (
      node["shop"="convenience"](around:${radius},${lat},${lng});
      node["shop"="supermarket"](around:${radius},${lat},${lng});
      node["amenity"="pharmacy"](around:${radius},${lat},${lng});
      node["amenity"="hospital"](around:${radius},${lat},${lng});
      node["amenity"="clinic"](around:${radius},${lat},${lng});
      node["railway"="station"](around:${radius},${lat},${lng});
    );
    out body;
    >;
    out skel qt;
  `;
  
  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });
    
    if (!response.ok) {
      throw new Error('Overpass API request failed');
    }
    
    const data = await response.json();
    
    for (const element of data.elements) {
      if (element.type !== 'node' || !element.lat || !element.lon) continue;
      
      const distance = calculateDistance(lat, lng, element.lat, element.lon);
      
      let type: AmenityType | null = null;
      let name = element.tags?.name || element.tags?.name_ja || 'Unknown';
      
      // Determine amenity type
      if (element.tags?.shop === 'convenience') {
        type = 'konbini';
        if (!element.tags?.name && !element.tags?.name_ja) name = 'Convenience Store';
      } else if (element.tags?.shop === 'supermarket') {
        type = 'supermarket';
        if (!element.tags?.name && !element.tags?.name_ja) name = 'Supermarket';
      } else if (element.tags?.amenity === 'pharmacy' || element.tags?.amenity === 'hospital' || element.tags?.amenity === 'clinic') {
        type = 'drugstore';
        if (!element.tags?.name && !element.tags?.name_ja) name = 'Drug Store';
      } else if (element.tags?.railway === 'station') {
        type = 'station';
        if (!element.tags?.name && !element.tags?.name_ja) name = 'Station';
      }
      
      if (type) {
        amenities.push({
          type,
          name,
          lat: element.lat,
          lng: element.lon,
          distance: Math.round(distance),
        });
      }
    }
    
    // Sort by distance
    amenities.sort((a, b) => a.distance - b.distance);
    
  } catch (error) {
    console.error('Error fetching amenities:', error);
  }
  
  return amenities;
}

export default function LeafletMap({ lat, lng, location, activeFilters, onCountsLoaded }: LeafletMapProps) {
  const [amenities, setAmenities] = useState<AmenityLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch amenities on mount
  useEffect(() => {
    let mounted = true;
    
    async function loadAmenities() {
      try {
        setLoading(true);
        const data = await fetchAmenities(lat, lng, 1000); // 1km radius
        if (mounted) {
          setAmenities(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load amenities');
          setLoading(false);
        }
      }
    }
    
    loadAmenities();
    
    return () => {
      mounted = false;
    };
  }, [lat, lng]);

  // Filter amenities based on active filters
  const filteredAmenities = useMemo(() => {
    return amenities.filter(a => activeFilters.includes(a.type));
  }, [amenities, activeFilters]);

  // Count amenities by type
  const counts = useMemo(() => {
    return {
      konbini: amenities.filter(a => a.type === 'konbini').length,
      supermarket: amenities.filter(a => a.type === 'supermarket').length,
      drugstore: amenities.filter(a => a.type === 'drugstore').length,
      station: amenities.filter(a => a.type === 'station').length,
    };
  }, [amenities]);

  // Notify parent of counts
  useEffect(() => {
    if (onCountsLoaded && !loading) {
      onCountsLoaded(counts);
    }
  }, [counts, loading, onCountsLoaded]);

  return (
    <div className="relative">
      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 z-10 bg-[#F5F1E8] rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-2">🗺️</div>
            <p className="text-[#78716C]">Loading nearby amenities...</p>
            <p className="text-xs text-[#A8A29E]">周辺施設を読み込み中...</p>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 z-10 bg-[#F5F1E8] rounded-lg flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-[#D84315] mb-2">⚠️ {error}</p>
            <p className="text-sm text-[#78716C]">Showing map without amenities</p>
          </div>
        </div>
      )}

      {/* 1km radius indicator */}
      <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-[#2C2416] shadow-sm">
        1km radius / 半径1km
      </div>

      <div className="w-full aspect-video rounded-lg overflow-hidden border border-[#E7E5E4]">
        <MapContainer
          center={[lat, lng]}
          zoom={16}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', minHeight: '400px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController lat={lat} lng={lng} />
          
          {/* 1km radius circle */}
          <Circle
            center={[lat, lng]}
            radius={1000}
            pathOptions={{
              color: '#3F51B5',
              fillColor: '#3F51B5',
              fillOpacity: 0.05,
              weight: 1,
              dashArray: '5, 5',
            }}
          />
          
          {/* Property Marker - Always shown */}
          <Marker 
            position={[lat, lng]} 
            icon={createPropertyIcon()}
          >
            <Popup>
              <div className="font-medium">{location}</div>
            </Popup>
          </Marker>
          
          {/* Amenity Markers - Only shown when filters active */}
          {filteredAmenities.map((amenity, index) => (
            <Marker
              key={`${amenity.type}-${index}-${amenity.lat}-${amenity.lng}`}
              position={[amenity.lat, amenity.lng]}
              icon={createAmenityIcon(amenity.type)}
            >
              <Popup>
                <div className="font-medium">{amenity.name}</div>
                <div className="text-sm text-[#78716C]">{amenity.distance}m away</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

    </div>
  );
}
