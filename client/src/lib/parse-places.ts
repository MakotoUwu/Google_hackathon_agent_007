/**
 * Parse places from agent response text
 * Extracts place information including name, address, and Google Maps links
 */

export interface ParsedPlace {
  id: string;
  name: string;
  address: string;
  googleMapsUrl: string;
  accessibilityFeatures: string[];
  lat?: number;
  lng?: number;
}

/**
 * Extract Google Maps place ID from URL
 */
function extractPlaceId(url: string): string | null {
  // Format: https://maps.google.com/?cid=15415702893301486651
  const cidMatch = url.match(/cid=(\d+)/);
  if (cidMatch) {
    return cidMatch[1];
  }
  
  // Format: https://maps.google.com/maps?q=place_id:ChIJ...
  const placeIdMatch = url.match(/place_id[=:]([^&\s]+)/);
  if (placeIdMatch) {
    return placeIdMatch[1];
  }
  
  return null;
}

/**
 * Parse places from agent response markdown text
 * Expects format like:
 * * **Place Name:** Located at Address. Features. [Google Maps Link](url)
 */
export function parsePlacesFromResponse(responseText: string): ParsedPlace[] {
  const places: ParsedPlace[] = [];
  
  // Split by bullet points or numbered lists
  const lines = responseText.split('\n');
  
  let currentPlace: Partial<ParsedPlace> | null = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) continue;
    
    // Check if this is a place entry (starts with * or number)
    if (trimmedLine.match(/^[\*\-\d]+\.\s*\*\*(.+?)\*\*/)) {
      // Save previous place if exists
      if (currentPlace && currentPlace.name && currentPlace.googleMapsUrl) {
        places.push({
          id: currentPlace.id || `place-${places.length}`,
          name: currentPlace.name,
          address: currentPlace.address || '',
          googleMapsUrl: currentPlace.googleMapsUrl,
          accessibilityFeatures: currentPlace.accessibilityFeatures || [],
          lat: currentPlace.lat,
          lng: currentPlace.lng,
        });
      }
      
      // Start new place
      const nameMatch = trimmedLine.match(/\*\*(.+?)\*\*/);
      if (nameMatch) {
        currentPlace = {
          name: nameMatch[1].trim(),
          accessibilityFeatures: [],
        };
        
        // Try to extract address from the same line
        const addressMatch = trimmedLine.match(/Located at (.+?)\./);
        if (addressMatch) {
          currentPlace.address = addressMatch[1].trim();
        } else {
          const situatedMatch = trimmedLine.match(/Situated at (.+?)\./);
          if (situatedMatch) {
            currentPlace.address = situatedMatch[1].trim();
          } else {
            const foundMatch = trimmedLine.match(/Found at (.+?)\./);
            if (foundMatch) {
              currentPlace.address = foundMatch[1].trim();
            }
          }
        }
        
        // Extract Google Maps URL
        const urlMatch = trimmedLine.match(/\[.*?\]\((https:\/\/maps\.google\.com\/[^\)]+)\)/);
        if (urlMatch) {
          currentPlace.googleMapsUrl = urlMatch[1];
          const placeId = extractPlaceId(urlMatch[1]);
          if (placeId) {
            currentPlace.id = placeId;
          }
        }
        
        // Extract accessibility features
        if (trimmedLine.includes('wheelchair')) {
          const features: string[] = [];
          if (trimmedLine.includes('wheelchair-accessible entrance') || trimmedLine.includes('wheelchair accessible entrance')) {
            features.push('Accessible Entrance');
          }
          if (trimmedLine.includes('wheelchair-accessible restroom') || trimmedLine.includes('wheelchair accessible restroom')) {
            features.push('Accessible Restroom');
          }
          if (trimmedLine.includes('wheelchair-accessible seating') || trimmedLine.includes('wheelchair accessible seating')) {
            features.push('Accessible Seating');
          }
          if (trimmedLine.includes('wheelchair-accessible parking') || trimmedLine.includes('wheelchair accessible parking')) {
            features.push('Accessible Parking');
          }
          currentPlace.accessibilityFeatures = features;
        }
      }
    } else if (currentPlace) {
      // Continue parsing current place from multi-line description
      if (!currentPlace.address && trimmedLine.match(/Located at |Situated at |Found at /)) {
        const addressMatch = trimmedLine.match(/(?:Located|Situated|Found) at (.+?)\./);
        if (addressMatch) {
          currentPlace.address = addressMatch[1].trim();
        }
      }
      
      // Extract URL if not found yet
      if (!currentPlace.googleMapsUrl) {
        const urlMatch = trimmedLine.match(/\[.*?\]\((https:\/\/maps\.google\.com\/[^\)]+)\)/);
        if (urlMatch) {
          currentPlace.googleMapsUrl = urlMatch[1];
          const placeId = extractPlaceId(urlMatch[1]);
          if (placeId) {
            currentPlace.id = placeId;
          }
        }
      }
      
      // Extract more accessibility features
      if (trimmedLine.includes('wheelchair') && currentPlace.accessibilityFeatures) {
        if (trimmedLine.includes('wheelchair-accessible entrance') || trimmedLine.includes('wheelchair accessible entrance')) {
          if (!currentPlace.accessibilityFeatures.includes('Accessible Entrance')) {
            currentPlace.accessibilityFeatures.push('Accessible Entrance');
          }
        }
        if (trimmedLine.includes('wheelchair-accessible restroom') || trimmedLine.includes('wheelchair accessible restroom')) {
          if (!currentPlace.accessibilityFeatures.includes('Accessible Restroom')) {
            currentPlace.accessibilityFeatures.push('Accessible Restroom');
          }
        }
        if (trimmedLine.includes('wheelchair-accessible seating') || trimmedLine.includes('wheelchair accessible seating')) {
          if (!currentPlace.accessibilityFeatures.includes('Accessible Seating')) {
            currentPlace.accessibilityFeatures.push('Accessible Seating');
          }
        }
        if (trimmedLine.includes('wheelchair-accessible parking') || trimmedLine.includes('wheelchair accessible parking')) {
          if (!currentPlace.accessibilityFeatures.includes('Accessible Parking')) {
            currentPlace.accessibilityFeatures.push('Accessible Parking');
          }
        }
      }
    }
  }
  
  // Add last place
  if (currentPlace && currentPlace.name && currentPlace.googleMapsUrl) {
    places.push({
      id: currentPlace.id || `place-${places.length}`,
      name: currentPlace.name,
      address: currentPlace.address || '',
      googleMapsUrl: currentPlace.googleMapsUrl,
      accessibilityFeatures: currentPlace.accessibilityFeatures || [],
      lat: currentPlace.lat,
      lng: currentPlace.lng,
    });
  }
  
  return places;
}

/**
 * Geocode a place using Google Maps Geocoding API
 * This requires the Google Maps API key
 */
export async function geocodePlace(address: string, apiKey: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  
  return null;
}
