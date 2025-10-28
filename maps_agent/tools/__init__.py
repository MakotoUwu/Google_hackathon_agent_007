"""
Custom tools for Maps Agent
"""
from google.adk.tools import FunctionTool
from .directions import get_accessible_route as _get_accessible_route
from .directions import get_place_directions_url as _get_place_directions_url

# Wrap functions with FunctionTool
get_accessible_route = FunctionTool(func=_get_accessible_route)
get_place_directions_url = FunctionTool(func=_get_place_directions_url)

__all__ = ["get_accessible_route", "get_place_directions_url"]
