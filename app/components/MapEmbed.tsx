'use client';

interface MapEmbedProps {
  location: string;
}

export default function MapEmbed({ location }: MapEmbedProps) {
  // Create a Google Maps embed URL for the location
  // Using a static map view since we don't have exact coordinates
  const encodedLocation = encodeURIComponent(`${location}, Tokyo, Japan`);
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3240.0!2d139.6917!3d35.6895!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDQxJzIyLjIiTiAxMznCsDQxJzMwLjEiRQ!5e0!3m2!1sen!2sjp!4v1`;
  
  // For a more dynamic approach, use the search query URL
  const searchMapUrl = `https://www.google.com/maps?q=${encodedLocation}&output=embed`;

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
      <iframe
        src={searchMapUrl}
        width="100%"
        height="100%"
        style={{ border: 0, minHeight: '300px' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map of ${location}`}
        className="w-full h-full"
      />
    </div>
  );
}
