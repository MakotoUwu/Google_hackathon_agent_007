import { useEffect, useRef, useState } from 'react';

interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  accessibilityFeatures?: string[];
  googleMapsUrl?: string;
}

interface MapViewProps {
  places: Place[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

export default function MapView({ 
  places, 
  center = { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
  zoom = 12 
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map) return;

    const newMap = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapId: 'DEMO_MAP_ID', // Required for advanced markers
    });

    setMap(newMap);
  }, [center, zoom, map]);

  // Update markers when places change
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    places.forEach(place => {
      const marker = new google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map,
        title: place.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4F46E5',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      // Build accessibility features HTML
      let featuresHtml = '';
      if (place.accessibilityFeatures && place.accessibilityFeatures.length > 0) {
        featuresHtml = `
          <div style="margin-top: 8px;">
            <strong style="font-size: 13px;">Accessibility:</strong>
            <ul style="margin: 4px 0; padding-left: 20px; font-size: 12px;">
              ${place.accessibilityFeatures.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      // Info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 300px;">
            <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">${place.name}</h3>
            ${place.address ? `<p style="margin: 4px 0; font-size: 14px; color: #666;">${place.address}</p>` : ''}
            ${featuresHtml}
            ${place.googleMapsUrl ? `
              <a 
                href="${place.googleMapsUrl}" 
                target="_blank" 
                rel="noopener noreferrer"
                style="
                  display: inline-block;
                  margin-top: 8px;
                  padding: 6px 12px;
                  background-color: #4F46E5;
                  color: white;
                  text-decoration: none;
                  border-radius: 4px;
                  font-size: 13px;
                  font-weight: 500;
                "
              >
                Open in Google Maps
              </a>
            ` : ''}
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (places.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      places.forEach(place => {
        bounds.extend({ lat: place.lat, lng: place.lng });
      });
      map.fitBounds(bounds);
      
      // Adjust zoom if only one place
      if (places.length === 1) {
        const listener = google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          if (map.getZoom() && map.getZoom()! > 15) {
            map.setZoom(15);
          }
        });
      }
    }
  }, [map, places]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-lg"
      style={{ minHeight: '400px' }}
    />
  );
}
