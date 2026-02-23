'use client';

import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import Link from 'next/link';
import { Property } from '../types/property';

interface PropertyMapProps {
  properties: Property[];
  onMarkerClick?: (property: Property) => void;
}

// Japanese-inspired color palette for markers
const JAPANESE_COLORS = {
  monthly: '#3F51B5',    // Indigo (ai-iro)
  weekly: '#6B8E23',     // Bamboo green
  apartment: '#D84315',  // Vermilion (shu-iro)
  default: '#78716C',    // Stone gray
  clusterSmall: '#3F51B5',
  clusterMedium: '#D84315',
  clusterLarge: '#283593',
};

// Fix Leaflet default marker icons in Next.js
const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
};

// Create custom marker icon based on property type
const createPropertyIcon = (type: string, price: number) => {
  const getColor = () => {
    switch (type) {
      case 'monthly_mansion':
        return JAPANESE_COLORS.monthly;
      case 'weekly_mansion':
        return JAPANESE_COLORS.weekly;
      case 'apartment':
        return JAPANESE_COLORS.apartment;
      default:
        return JAPANESE_COLORS.default;
    }
  };

  const color = getColor();
  const priceText = price >= 100000 
    ? `¥${(price / 10000).toFixed(0)}万` 
    : `¥${(price / 1000).toFixed(0)}K`;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        color: white;
        padding: 4px 8px;
        border-radius: 16px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 50px;
      ">
        ${priceText}
      </div>
    `,
    iconSize: [60, 30],
    iconAnchor: [30, 15],
    popupAnchor: [0, -15],
  });
};

// Marker Cluster Group component
function MarkerClusterGroup({ properties }: { properties: Property[] }) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize marker cluster group
    const markerCluster = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 80,
      iconCreateFunction: (cluster) => {
        const childCount = cluster.getChildCount();
        let size = 'small';
        let color = JAPANESE_COLORS.clusterSmall;
        
        if (childCount >= 100) {
          size = 'large';
          color = JAPANESE_COLORS.clusterLarge;
        } else if (childCount >= 50) {
          size = 'large';
          color = JAPANESE_COLORS.clusterLarge;
        } else if (childCount >= 20) {
          size = 'medium';
          color = JAPANESE_COLORS.clusterMedium;
        }

        const sizePx = size === 'large' ? 50 : size === 'medium' ? 40 : 30;
        
        return L.divIcon({
          html: `<div style="
            background-color: ${color};
            width: ${sizePx}px;
            height: ${sizePx}px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: ${size === 'large' ? '14px' : '12px'};
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">${childCount}</div>`,
          className: 'marker-cluster',
          iconSize: L.point(sizePx, sizePx),
        });
      },
    });

    clusterRef.current = markerCluster;
    map.addLayer(markerCluster);

    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
      }
    };
  }, [map]);

  useEffect(() => {
    if (!clusterRef.current) return;

    // Clear existing markers
    clusterRef.current.clearLayers();

    // Add markers for each property
    const markers: L.Marker[] = [];
    properties.forEach((property) => {
      if (!property.lat || !property.lng) return;

      const marker = L.marker([property.lat, property.lng], {
        icon: createPropertyIcon(property.type, property.price),
      });

      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div style="min-width: 200px; font-family: system-ui, sans-serif;">
          <div style="position: relative; margin: -12px -12px 8px -12px;">
            <img 
              src="${property.photos?.[0] || '/placeholder-property.jpg'}" 
              alt="${property.location}"
              style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px 4px 0 0;"
            />
            ${property.furnished ? '<span style="position: absolute; top: 4px; left: 4px; background: #6B8E23; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">Furnished</span>' : ''}
          </div>
          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #2C2416;">${property.location}</h3>
          <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #D84315;">
            ¥${property.price.toLocaleString()}/month
          </p>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #78716C;">
            ${property.nearestStation} • ${property.walkTime} min walk
          </p>
          <a 
            href="/property/${property.id}" 
            style="
              display: block; 
              text-align: center; 
              background: #3F51B5; 
              color: white; 
              padding: 6px 12px; 
              border-radius: 6px; 
              text-decoration: none; 
              font-size: 12px;
              font-weight: 500;
            "
          >
            View Details →
          </a>
        </div>
      `;

      marker.bindPopup(popupContent);
      markers.push(marker);
    });

    clusterRef.current.addLayers(markers);
  }, [properties]);

  return null;
}

// Map bounds fitter
function MapBoundsFitter({ properties }: { properties: Property[] }) {
  const map = useMap();

  useEffect(() => {
    if (properties.length === 0) return;

    const validProperties = properties.filter(p => p.lat != null && p.lng != null);
    if (validProperties.length === 0) return;

    if (validProperties.length === 1) {
      map.setView([validProperties[0].lat!, validProperties[0].lng!], 15);
    } else {
      const bounds = L.latLngBounds(
        validProperties.map(p => [p.lat!, p.lng!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [map, properties]);

  return null;
}

export default function PropertyMap({ properties }: PropertyMapProps) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  // Default to Tokyo center
  const defaultCenter: [number, number] = [35.6762, 139.6503];

  const validProperties = useMemo(() => 
    properties.filter(p => p.lat && p.lng),
    [properties]
  );

  if (validProperties.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-[#F5F1E8] rounded-xl">
        <div className="text-center">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-[#78716C]">No properties with location data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[50vh] md:h-[600px] min-h-[300px] rounded-xl overflow-hidden shadow-lg border border-[#E7E5E4]">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup properties={validProperties} />
        <MapBoundsFitter properties={validProperties} />
      </MapContainer>
    </div>
  );
}
