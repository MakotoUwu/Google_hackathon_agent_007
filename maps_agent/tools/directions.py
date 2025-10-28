"""
Custom function tools for Google Directions API
Following ADK best practices for function tools
"""
import os
import requests
from typing import Dict, List, Optional


def get_accessible_route(
    origin: str,
    destination: str,
    waypoints: Optional[str] = None,
    avoid_stairs: bool = True,
) -> str:
    """
    Calculate an accessible route between two locations using Google Directions API.
    
    This tool finds routes that are suitable for people with mobility limitations,
    avoiding stairs and prioritizing wheelchair-accessible paths when possible.
    
    Args:
        origin: Starting location (address, place name, or coordinates)
        destination: Ending location (address, place name, or coordinates)
        waypoints: Optional intermediate stops (comma-separated)
        avoid_stairs: Whether to avoid routes with stairs (default: True)
    
    Returns:
        Dictionary containing route information including:
        - duration: Estimated travel time
        - distance: Total distance
        - steps: Turn-by-turn directions
        - accessibility_notes: Accessibility information for the route
        - polyline: Encoded polyline for map display
    """
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        import json
        return json.dumps({"error": "GOOGLE_API_KEY not configured"})
    
    # Build request parameters
    params = {
        "origin": origin,
        "destination": destination,
        "mode": "walking",  # Walking mode for accessibility
        "alternatives": "true",  # Get alternative routes
        "key": api_key,
    }
    
    # Add waypoints if provided
    if waypoints:
        params["waypoints"] = waypoints
    
    try:
        response = requests.get(
            "https://maps.googleapis.com/maps/api/directions/json",
            params=params,
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()
        
        if data["status"] != "OK":
            import json
        return json.dumps({
                "error": f"Directions API error: {data.get('status')}",
                "message": data.get("error_message", "Unknown error"),
            })
        
        # Get the best route (first route is usually optimal)
        route = data["routes"][0]
        leg = route["legs"][0]
        
        # Extract steps with accessibility considerations
        steps = []
        for step in leg["steps"]:
            step_info = {
                "instruction": step["html_instructions"],
                "distance": step["distance"]["text"],
                "duration": step["duration"]["text"],
                "travel_mode": step.get("travel_mode", "WALKING"),
            }
            
            # Check for stairs or steep inclines in instructions
            instruction_lower = step["html_instructions"].lower()
            if "stair" in instruction_lower:
                step_info["accessibility_warning"] = "⚠️ This step may involve stairs"
            elif "steep" in instruction_lower:
                step_info["accessibility_warning"] = "⚠️ This step may be steep"
            
            steps.append(step_info)
        
        # Build result
        result = {
            "status": "success",
            "origin": leg["start_address"],
            "destination": leg["end_address"],
            "duration": leg["duration"]["text"],
            "distance": leg["distance"]["text"],
            "steps": steps,
            "polyline": route["overview_polyline"]["points"],
            "bounds": route["bounds"],
            "accessibility_notes": _generate_accessibility_notes(steps),
        }
        
        # Add alternative routes if available
        if len(data["routes"]) > 1:
            result["alternatives"] = [
                {
                    "duration": r["legs"][0]["duration"]["text"],
                    "distance": r["legs"][0]["distance"]["text"],
                    "summary": r.get("summary", "Alternative route"),
                }
                for r in data["routes"][1:3]  # Up to 2 alternatives
            ]
        
        import json
        return json.dumps(result)
        
    except requests.RequestException as e:
        import json
        return json.dumps({"error": f"Failed to fetch directions: {str(e)}"})


def _generate_accessibility_notes(steps: List[Dict]) -> str:
    """Generate accessibility summary from route steps"""
    warnings = []
    for step in steps:
        if "accessibility_warning" in step:
            warnings.append(step["accessibility_warning"])
    
    if not warnings:
        return "✅ This route appears to be wheelchair accessible with no stairs detected."
    else:
        return f"⚠️ Accessibility concerns: {len(warnings)} potential obstacles detected. " + \
               "Consider checking alternative routes or contacting venues for accessibility details."


def get_place_directions_url(
    origin: str,
    destination: str,
    travelmode: str = "walking",
) -> str:
    """
    Generate a Google Maps URL for directions between two places.
    
    Args:
        origin: Starting location
        destination: Ending location
        travelmode: Mode of travel (walking, driving, transit, bicycling)
    
    Returns:
        Google Maps URL that opens directions
    """
    import urllib.parse
    
    base_url = "https://www.google.com/maps/dir/"
    params = {
        "api": "1",
        "origin": origin,
        "destination": destination,
        "travelmode": travelmode,
    }
    
    query_string = urllib.parse.urlencode(params)
    return f"{base_url}?{query_string}"
