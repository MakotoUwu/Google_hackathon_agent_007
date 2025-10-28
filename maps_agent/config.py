"""
Configuration for Maps Agent with Vertex AI
"""
import os

# Set environment variables for Vertex AI
os.environ['GOOGLE_GENAI_USE_VERTEXAI'] = 'TRUE'

# Get from environment or use defaults
os.environ.setdefault('GOOGLE_CLOUD_PROJECT', os.getenv('GOOGLE_CLOUD_PROJECT', 'qwiklabs-gcp-00-6bf2cd71dda4'))
os.environ.setdefault('GOOGLE_CLOUD_LOCATION', os.getenv('GOOGLE_CLOUD_LOCATION', 'us-central1'))
os.environ.setdefault('GOOGLE_MAPS_API_KEY', os.getenv('GOOGLE_MAPS_API_KEY', ''))

# Use local service account if available
import pathlib
local_creds = pathlib.Path(__file__).parent / 'qwiklabs-gcp-00-6bf2cd71dda4-c40f82b6785d.json'
if local_creds.exists():
    os.environ.setdefault('GOOGLE_APPLICATION_CREDENTIALS', str(local_creds))
