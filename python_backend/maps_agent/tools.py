"""
Google Places API tool for finding places with Maps grounding
"""
import os
import requests
from typing import Optional


def find_places(
    query: str,
    location: Optional[str] = None,
) -> str:
    """
    Find places using Google Places API Text Search
    
    Args:
        query: Search query (e.g., "Italian restaurants in Kyiv")
        location: Optional location bias (e.g., "Kyiv, Ukraine")
    
    Returns:
        JSON string with place results including names, addresses, ratings
    """
    api_key = os.getenv("GOOGLE_MAPS_API_KEY") or os.getenv("GOOGLE_API_KEY")
    
    if not api_key:
        return '{"error": "GOOGLE_MAPS_API_KEY not configured"}'
    
    # Construct search query
    search_query = query
    if location and location.lower() not in query.lower():
        search_query = f"{query} in {location}"
    
    # Use Places API (New) Text Search
    url = "https://places.googleapis.com/v1/places:searchText"
    
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.types,places.googleMapsUri"
    }
    
    payload = {
        "textQuery": search_query,
        "languageCode": "en"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        places = data.get("places", [])
        
        if not places:
            return f'{{"message": "No places found for query: {search_query}"}}'
        
        # Format results
        results = []
        for place in places[:5]:  # Limit to top 5 results
            result = {
                "name": place.get("displayName", {}).get("text", "Unknown"),
                "address": place.get("formattedAddress", "Address not available"),
                "rating": place.get("rating"),
                "user_ratings": place.get("userRatingCount"),
                "location": place.get("location", {}),
                "types": place.get("types", []),
                "google_maps_uri": place.get("googleMapsUri", "")
            }
            results.append(result)
        
        import json
        return json.dumps({"places": results, "query": search_query}, indent=2)
        
    except requests.exceptions.RequestException as e:
        return f'{{"error": "Failed to fetch places: {str(e)}"}}'
    except Exception as e:
        return f'{{"error": "Unexpected error: {str(e)}"}}'
