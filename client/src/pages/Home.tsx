import { useState, useEffect } from 'react';
import { APP_TITLE } from '@/const';
import ChatInterface from '@/components/ChatInterface';
import MapView from '@/components/MapView';
import { VoiceButton } from '@/components/VoiceButton';
import { type ParsedPlace, geocodePlace } from '@/lib/parse-places';

interface MapPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  accessibilityFeatures?: string[];
  googleMapsUrl?: string;
}

export default function Home() {
  const [places, setPlaces] = useState<MapPlace[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handlePlacesFound = async (newPlaces: ParsedPlace[]) => {
    setIsGeocoding(true);
    
    // Get Google Maps API key from environment
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    // Geocode places that don't have coordinates
    const geocodedPlaces: MapPlace[] = [];
    
    for (const place of newPlaces) {
      let lat = place.lat;
      let lng = place.lng;
      
      // If coordinates not available, try to geocode
      if (!lat || !lng) {
        if (place.address && apiKey) {
          const coords = await geocodePlace(place.address, apiKey);
          if (coords) {
            lat = coords.lat;
            lng = coords.lng;
          }
        }
      }
      
      // Only add places with valid coordinates
      if (lat && lng) {
        geocodedPlaces.push({
          id: place.id,
          name: place.name,
          lat,
          lng,
          address: place.address,
          accessibilityFeatures: place.accessibilityFeatures,
          googleMapsUrl: place.googleMapsUrl,
        });
      }
    }
    
    setPlaces(geocodedPlaces);
    setIsGeocoding(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <h1 className="text-2xl font-bold">{APP_TITLE}</h1>
          <p className="text-sm text-muted-foreground">
            ♿ Empowering people with mobility challenges to explore the world confidently
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          {/* Chat Interface */}
          <div className="flex flex-col bg-card rounded-lg border shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Plan Your Journey</h2>
              <p className="text-sm text-muted-foreground">
                Discover wheelchair-accessible places with verified accessibility features
              </p>
            </div>
            
            {/* Voice Mode */}
            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">🎤 Voice Mode (Beta)</h3>
              <VoiceButton 
                onTranscript={(text) => console.log('Transcript:', text)}
                onPlacesFound={handlePlacesFound}
              />
            </div>
            
            <div className="flex-1 overflow-hidden">
              <ChatInterface onPlacesFound={handlePlacesFound} />
            </div>
          </div>

          {/* Map View */}
          <div className="flex flex-col bg-card rounded-lg border shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Map</h2>
              <p className="text-sm text-muted-foreground">
                {isGeocoding
                  ? 'Locating places on map...'
                  : places.length > 0
                  ? `Showing ${places.length} accessible place${places.length > 1 ? 's' : ''}`
                  : 'Places will appear here'}
              </p>
            </div>
            <div className="flex-1">
              <MapView places={places} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4 bg-card">
        <div className="container text-center text-sm text-muted-foreground">
          Built with ❤️ using Google ADK & Google Maps Platform | Making accessibility accessible
        </div>
      </footer>
    </div>
  );
}
