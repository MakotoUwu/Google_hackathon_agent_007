"""
Configuration for Maps Agent with Vertex AI
"""
import os

# Set environment variables for Vertex AI
# These should be set via environment variables, not hardcoded
os.environ['GOOGLE_GENAI_USE_VERTEXAI'] = 'TRUE'

# Get from environment or use defaults
os.environ.setdefault('GOOGLE_CLOUD_PROJECT', os.getenv('GOOGLE_CLOUD_PROJECT', 'your-project-id'))
os.environ.setdefault('GOOGLE_CLOUD_LOCATION', os.getenv('GOOGLE_CLOUD_LOCATION', 'us-central1'))
os.environ.setdefault('GOOGLE_MAPS_API_KEY', os.getenv('GOOGLE_MAPS_API_KEY', ''))
os.environ.setdefault('GOOGLE_APPLICATION_CREDENTIALS', os.getenv('GOOGLE_APPLICATION_CREDENTIALS', ''))
