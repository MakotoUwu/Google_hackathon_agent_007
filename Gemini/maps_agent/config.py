"""
Configuration for Maps Agent with Vertex AI
"""
import os

# Set environment variables for Vertex AI
os.environ['GOOGLE_GENAI_USE_VERTEXAI'] = 'TRUE'
os.environ['GOOGLE_CLOUD_PROJECT'] = 'qwiklabs-gcp-00-6bf2cd71dda4'
os.environ['GOOGLE_CLOUD_LOCATION'] = 'us-central1'
os.environ['GOOGLE_MAPS_API_KEY'] = 'YOUR_API_KEY_HERE'
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/home/ubuntu/maps-agent-hackathon/maps_agent/qwiklabs-gcp-00-6bf2cd71dda4-c40f82b6785d.json'
