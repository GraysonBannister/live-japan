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
    // If we have coordinates, use them to center the map on a single location
    if (lat && lng) {
      // Use Google Maps embed with coordinates - shows single location with marker
      const coordUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d16!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0:0x0!2z${lat},${lng}!5e0!3m2!1sen!2sjp!4v1`;
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
      <div className="w-full aspect-video rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-gray-600 mb-2">📍 {location}</p>
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location + ', Tokyo, Japan')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            View on Google Maps →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
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