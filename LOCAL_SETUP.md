# Local Setup Guide - Accessible Journey Assistant

Quick guide to run the project locally from the ZIP archive.

## Prerequisites

- **Node.js 22+** (with npm/pnpm)
- **Python 3.11+** (with pip)
- **Google Cloud Project** with:
  - Vertex AI API enabled
  - Service account with Vertex AI permissions
  - Google Maps API key

## Setup Steps

### 1. Extract ZIP Archive

```bash
unzip accessible-journey-assistant.zip
cd maps-agent-hackathon
```

### 2. Install Dependencies

#### Node.js Dependencies
```bash
npm install -g pnpm@latest
pnpm install
```

#### Python Dependencies
```bash
pip install google-genai google-adk fastapi uvicorn websockets python-dotenv
```

### 3. Configure Environment Variables

Create `.env` file in project root:

```bash
# Google Maps API Key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Google Cloud Project
GOOGLE_CLOUD_PROJECT=your-gcp-project-id

# Service Account (for Vertex AI)
GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account-key.json

# Optional: Voice Server
VOICE_SERVER_URL=http://localhost:8001
```

### 4. Setup Google Cloud Authentication

#### Option A: Service Account Key (Recommended for local dev)

1. Download service account JSON key from Google Cloud Console
2. Save it as `service-account-key.json` in project root
3. Set environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="./service-account-key.json"
   ```

#### Option B: Application Default Credentials

```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

### 5. Configure ADK Agent

Edit `maps_agent/.env`:

```bash
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=../service-account-key.json
```

### 6. Start Development Servers

#### Terminal 1: Main App (Node.js + tRPC)
```bash
pnpm run dev
```

This starts:
- Frontend dev server on http://localhost:3000
- Backend tRPC server
- Python ADK agent (spawned by Node.js)

#### Terminal 2: Voice Server (Optional)
```bash
cd maps_agent
python voice_server.py
```

This starts the Gemini Live API voice server on http://localhost:8001

### 7. Open Browser

Navigate to: **http://localhost:3000**

## Testing the Application

### Text Chat Mode

1. Click in the chat input at the bottom
2. Try example queries:
   - "Find wheelchair-accessible cafes in San Francisco"
   - "Show me accessible restaurants near Golden Gate Park"
   - "Plan a route from Union Square to Fisherman's Wharf with accessible stops"

### Voice Mode (if voice server is running)

1. Click the microphone button in the top-right corner
2. Allow microphone permissions in your browser
3. Speak your query naturally
4. The agent will respond with voice and show results on the map

## Troubleshooting

### "Agent failed to start" Error

**Cause:** Python dependencies not installed or wrong Python version

**Fix:**
```bash
python3 --version  # Should be 3.11+
pip install google-genai google-adk
```

### "Vertex AI authentication failed" Error

**Cause:** Service account credentials not configured

**Fix:**
1. Verify `GOOGLE_APPLICATION_CREDENTIALS` points to valid JSON key
2. Ensure service account has "Vertex AI User" role
3. Check Vertex AI API is enabled in GCP project

### "Map not loading" Error

**Cause:** Invalid Google Maps API key

**Fix:**
1. Verify `GOOGLE_MAPS_API_KEY` in `.env`
2. Check API key has Maps JavaScript API enabled
3. Ensure API key has no domain restrictions (or add localhost)

### "Microphone permission denied" Error

**Cause:** Browser blocked microphone access

**Fix:**
1. Click the lock icon in browser address bar
2. Allow microphone permissions
3. Refresh the page
4. Click microphone button again

### Port Already in Use

**Cause:** Another process using port 3000 or 8001

**Fix:**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm run dev
```

## Project Structure

```
maps-agent-hackathon/
├── client/              # React frontend
│   ├── src/
│   │   ├── pages/Home.tsx        # Main UI
│   │   └── components/           # UI components
├── server/              # Node.js backend
│   ├── routers.ts                # tRPC routes
│   ├── adk-agent.ts              # ADK agent wrapper
│   └── voice-proxy.ts            # WebSocket proxy
├── maps_agent/          # Python ADK agent
│   ├── agent.py                  # Main agent logic
│   ├── tools/                    # Custom tools
│   └── voice_server.py           # Voice server
├── Dockerfile           # Cloud Run deployment
└── .env                 # Environment variables
```

## Performance Tips

1. **First query takes longer** (~5-10 seconds) - agent initialization
2. **Subsequent queries are faster** (~2-3 seconds)
3. **Voice mode has latency** - streaming audio over WebSocket
4. **Map rendering** - depends on number of markers

## API Limits

- **Vertex AI (Gemini 2.0):** 60 requests/minute (free tier)
- **Google Maps API:** 
  - Maps JavaScript API: 28,000 loads/month (free)
  - Places API: $17 per 1000 requests
  - Directions API: $5 per 1000 requests

## Security Notes

- **Never commit** `.env` or service account keys to Git
- **Use environment variables** for all secrets
- **Restrict API keys** to specific domains in production
- **Rotate credentials** regularly

## Next Steps

1. ✅ Test basic chat functionality
2. ✅ Try voice mode (if needed)
3. ✅ Customize agent instructions in `maps_agent/agent.py`
4. ✅ Add more tools in `maps_agent/tools/`
5. ✅ Deploy to Cloud Run (see DEPLOYMENT.md)

## Support

For issues or questions:
- Check logs in browser console (F12)
- Check server logs in terminal
- Review error messages carefully
- Verify all environment variables are set

---

**Ready to help people with mobility challenges find accessible places! ♿️🗺️**
