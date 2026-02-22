'use client';

import { useEffect, useState } from 'react';

interface MapEmbedProps {
  location: string;
  lat?: number | null;
  lng?: number | null;
}

export default function MapEmbed({ location, lat, lng }: MapEmbedProps) {
  const [mapUrl, setMapUrl] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    // If we have coordinates, use them to show a marker at that exact location
    if (lat && lng) {
      // Use Google Maps embed with coordinates as search query - this shows a marker
      const coordQuery = `${lat},${lng}`;
      const coordUrl = `https://www.google.com/maps?q=${coordQuery}&output=embed`;
      setMapUrl(coordUrl);
      return;
    }
    
    // Fallback: Use the location string for search-based map
    let searchQuery = location;
    
    // Check if location already contains "Tokyo" or "東京都"
    if (!location.includes('Tokyo') && !location.includes('東京都')) {
      // If it's just a ward name, add Tokyo
      if (location.match(/(区|市)$/)) {
        searchQuery = `${location}, Tokyo, Japan`;
      } else {
        searchQuery = `${location}, Tokyo, Japan`;
      }
    }
    
    const encodedQuery = encodeURIComponent(searchQuery);
    
    // Use the search-based embed
    const searchUrl = `https://www.google.com/maps?q=${encodedQuery}&output=embed`;
    
    setMapUrl(searchUrl);
  }, [location, lat, lng]);

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
    <div className="w-full aspect-video rounded-lg overflow-hidden bg-[#F5F1E8] border border-[#E7E5E4]">
      {mapUrl && (
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0, minHeight: '300px' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map of ${location}`}
          className="w-full h-full"
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}
