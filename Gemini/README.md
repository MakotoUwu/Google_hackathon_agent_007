# Gemini AI Agent Files

This folder contains the Python-based Google ADK agent implementation and related AI components.

## Contents

- **maps_agent/** - Google ADK agent with Gemini 2.0 Flash
- **python_backend/** - Python backend services

## Setup

1. Install dependencies:
```bash
pip install google-genai google-adk
```

2. Set environment variables:
```bash
export GOOGLE_CLOUD_PROJECT=your-project-id
export GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
export GOOGLE_MAPS_API_KEY=your-maps-api-key
```

3. Run agent:
```bash
cd maps_agent
python3.11 runner.py "Find accessible cafes in Berlin" test_session
```

## Security Note

**Do not commit credentials!**
- Service account JSON files
- API keys
- Environment files

These are already excluded in .gitignore.
