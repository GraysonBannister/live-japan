'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type AmenityType = 'konbini' | 'supermarket' | 'drugstore' | 'station';

interface LeafletMapProps {
  lat: number;
  lng: number;
  location: string;
  activeFilters: AmenityType[];
}

interface AmenityLocation {
  type: AmenityType;
  name: string;
  lat: number;
  lng: number;
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
  const amenities: AmenityLocation[] = [];
  
  // Convenience store ~100m north
  amenities.push({
    type: 'konbini',
    name: '7-Eleven / セブンイレブン',
    lat: centerLat + 0.001,
    lng: centerLng,
  });
  
  // Station ~200m east
  amenities.push({
    type: 'station',
    name: 'Nearby Station / 最寄駅',
    lat: centerLat,
    lng: centerLng + 0.002,
  });
  
  // Supermarket ~150m south
  amenities.push({
    type: 'supermarket',
    name: 'Supermarket / スーパー',
    lat: centerLat - 0.0015,
    lng: centerLng,
  });
  
  // Drugstore ~120m west
  amenities.push({
    type: 'drugstore',
    name: 'Drug Store / 薬局',
    lat: centerLat,
    lng: centerLng - 0.0012,
  });
  
  return amenities;
};

export default function LeafletMap({ lat, lng, location, activeFilters }: LeafletMapProps) {
  // Generate mock amenities
  const amenities = useMemo(() => getMockAmenities(lat, lng), [lat, lng]);
  
  // Filter amenities based on active filters
  const filteredAmenities = amenities.filter(a => activeFilters.includes(a.type));

  return (
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
  );
}
