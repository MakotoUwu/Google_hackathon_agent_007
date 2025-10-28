# Maps Agent with Google ADK

AI-powered accessibility maps assistant built with Google Agent Development Kit (ADK) and Google Maps Grounding.

## 🎯 Overview

This application helps people with disabilities find accessible places using natural language queries. It combines:

- **Google ADK** - Agent framework with google_maps_grounding tool
- **Vertex AI** - Gemini model for intelligent responses
- **Google Maps** - Visualization and place information
- **React + tRPC** - Modern full-stack architecture

## ✨ Features

### Core Functionality
- 🤖 **AI Agent** - Natural language queries for accessible places
- 🗺️ **Maps Integration** - Visual display of found locations
- ♿ **Accessibility Focus** - Wheelchair accessibility information
- 💬 **Chat Interface** - Conversational user experience

### Technical Features
- **Google Maps Grounding** - Real-time place search with accessibility data
- **tRPC Backend** - Type-safe API between frontend and Python agent
- **React Frontend** - Modern UI with real-time updates
- **Session Management** - Maintains conversation context

## 🏗️ Architecture

### High-Level Overview

![Architecture Diagram](docs/architecture.png)

### Detailed Technical Architecture

![Detailed Architecture](docs/detailed-architecture.png)

### Text Representation

```
┌─────────────────┐
│  React Frontend │
│   (TypeScript)  │
└────────┬────────┘
         │ tRPC (HTTP/JSON)
┌────────▼────────┐
│  Node.js Server │
│   (TypeScript)  │
└────────┬────────┘
         │ child_process.spawn
┌────────▼────────┐
│  Python Agent   │
│  (Google ADK)   │
└────────┬────────┘
         │ gRPC / REST
┌────────▼────────┐
│   Vertex AI     │
│ (Gemini 2.0)    │
└────────┬────────┘
         │ Function Calling
┌────────▼────────┐
│ Google Maps API │
│   (Grounding)   │
└─────────────────┘
```

## 🔬 Google ADK Agent Workflow

### Overview

Google Agent Development Kit (ADK) provides a framework for building AI agents that can use tools and maintain conversation context. Here's how our accessibility agent works:

### 1. Agent Initialization

**File:** `maps_agent/agent.py`

```python
from google.adk.agents import Agent
from google.adk.tools import google_maps_grounding

root_agent = Agent(
    name="maps_agent",
    model="gemini-2.0-flash-exp",
    instructions="...",
    tools=[google_maps_grounding],
)
```

**Technologies Used:**
- **Google ADK Python SDK** - Agent framework
- **Vertex AI API** - Model hosting and inference
- **gRPC** - Communication protocol between ADK and Vertex AI

### 2. User Query Flow

#### Step 1: User Input → Frontend
```
User types: "Find wheelchair accessible cafes in San Francisco"
  ↓
React ChatInterface component
  ↓
tRPC mutation: agent.query({ query, sessionId })
```

#### Step 2: Frontend → Backend
```
tRPC Client (HTTP POST)
  ↓
Node.js Server (port 3000)
  ↓
server/routers.ts: agent.query mutation
  ↓
server/adk-agent.ts: runAgent()
```

**Protocol:** HTTP/JSON over tRPC

#### Step 3: Backend → Python Agent
```
Node.js spawns Python process:
  python3.11 runner.py "query" "session_id" "user_id"
  ↓
maps_agent/runner.py
  ↓
ADK Runner.run() method
```

**Protocol:** stdin/stdout (JSON)

#### Step 4: Python Agent → Vertex AI
```
ADK Runner
  ↓
Vertex AI API (gRPC)
  ↓
Gemini 2.0 Flash Model
```

**Technologies:**
- **gRPC** - High-performance RPC framework
- **Protocol Buffers** - Binary serialization
- **Vertex AI Endpoint** - `{location}-aiplatform.googleapis.com`
- **Authentication** - Service Account JSON key

**Request Structure:**
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [{
        "text": "Find wheelchair accessible cafes in San Francisco"
      }]
    }
  ],
  "tools": [{
    "googleSearchRetrieval": {
      "dynamicRetrievalConfig": {
        "mode": "MODE_DYNAMIC",
        "dynamicThreshold": 0.7
      }
    }
  }],
  "generationConfig": {
    "temperature": 1.0,
    "topP": 0.95
  }
}
```

### 3. Tool Execution (google_maps_grounding)

#### Step 5: Gemini Decides to Use Tool
```
Gemini analyzes query
  ↓
Determines: Need to search for places
  ↓
Generates Function Call:
  {
    "name": "google_maps_grounding",
    "args": {
      "query": "wheelchair accessible cafes San Francisco",
      "location": {"lat": 37.7749, "lng": -122.4194}
    }
  }
```

**Technology:** **Function Calling** (Gemini native capability)

#### Step 6: ADK Executes Tool
```
ADK intercepts function call
  ↓
Calls Google Maps Platform APIs:
  - Places API (New)
  - Geocoding API
  - Place Details API
  ↓
Retrieves:
  - Place names
  - Addresses
  - Accessibility attributes
  - Place IDs
  - Coordinates
```

**APIs Used:**
- **Google Maps Platform - Places API (New)**
  - Endpoint: `https://places.googleapis.com/v1/places:searchText`
  - Protocol: REST/JSON
  - Authentication: API Key
  
- **Place Details API**
  - Accessibility attributes:
    - `wheelchairAccessibleEntrance`
    - `wheelchairAccessibleRestroom`
    - `wheelchairAccessibleSeating`
    - `wheelchairAccessibleParking`

**Request Example:**
```http
POST https://places.googleapis.com/v1/places:searchText
Content-Type: application/json
X-Goog-Api-Key: YOUR_API_KEY

{
  "textQuery": "wheelchair accessible cafes in San Francisco",
  "includedType": "cafe",
  "locationBias": {
    "circle": {
      "center": {"latitude": 37.7749, "longitude": -122.4194},
      "radius": 5000.0
    }
  }
}
```

**Response Structure:**
```json
{
  "places": [
    {
      "id": "ChIJ...",
      "displayName": {"text": "Cafe Name"},
      "formattedAddress": "123 Main St, San Francisco, CA",
      "location": {"latitude": 37.7749, "longitude": -122.4194},
      "accessibilityOptions": {
        "wheelchairAccessibleEntrance": true,
        "wheelchairAccessibleRestroom": true,
        "wheelchairAccessibleSeating": true
      },
      "googleMapsUri": "https://maps.google.com/?cid=..."
    }
  ]
}
```

#### Step 7: Tool Result → Gemini
```
ADK packages tool result
  ↓
Sends back to Gemini:
  {
    "role": "function",
    "name": "google_maps_grounding",
    "response": {
      "places": [...]
    }
  }
  ↓
Gemini processes results
  ↓
Generates natural language response
```

### 4. Response Generation

#### Step 8: Gemini → ADK
```
Gemini generates response:
  "Here are some wheelchair-accessible cafes in San Francisco:
   1. Doppio Coffee & Brunch: Located at 1551 Mission St..."
  ↓
ADK Runner receives response
  ↓
Returns JSON to stdout
```

#### Step 9: Python → Node.js
```
Python process outputs JSON:
{
  "success": true,
  "response": "Here are some wheelchair-accessible cafes...",
  "session_id": "session_123",
  "user_id": "user_456"
}
  ↓
Node.js reads stdout
  ↓
Parses JSON
  ↓
Returns via tRPC
```

#### Step 10: Backend → Frontend
```
tRPC response
  ↓
React receives data
  ↓
ChatInterface displays message
  ↓
parse-places.ts extracts place data
  ↓
MapView displays markers
```

### 5. Session Management

**Technology:** ADK Session State

```python
# ADK automatically maintains session state
session = runner.create_session(
    session_id="session_123",
    user_id="user_456"
)

# Conversation history is preserved
# Each turn includes:
# - User messages
# - Agent responses  
# - Tool calls and results
```

**Storage:** In-memory (ephemeral) or can be persisted to database

## 🔐 Authentication & Authorization

### Service Account Authentication

**File:** `maps_agent/qwiklabs-gcp-00-*.json`

```json
{
  "type": "service_account",
  "project_id": "your-project",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "service-account@your-project.iam.gserviceaccount.com",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}
```

**Flow:**
1. ADK reads service account key
2. Creates JWT (JSON Web Token)
3. Exchanges JWT for access token
4. Uses access token for API calls

**Protocol:** OAuth 2.0 with JWT Bearer Tokens

## 📡 Network Protocols Summary

| Layer | Protocol | Purpose |
|-------|----------|----------|
| Frontend ↔ Backend | HTTP/1.1 + JSON | tRPC communication |
| Backend ↔ Python | stdin/stdout | Process communication |
| Python ↔ Vertex AI | gRPC + Protobuf | Model inference |
| Python ↔ Maps API | HTTPS + JSON | Place search |
| Authentication | OAuth 2.0 + JWT | API authorization |

## 🛠️ Google Technologies Used

1. **Google ADK (Agent Development Kit)**
   - Agent framework
   - Tool integration
   - Session management

2. **Vertex AI**
   - Gemini 2.0 Flash model
   - Function calling
   - gRPC API

3. **Google Maps Platform**
   - Places API (New)
   - Place Details API
   - Maps JavaScript API
   - Geocoding API

4. **Google Cloud IAM**
   - Service accounts
   - API key management
   - Access control

5. **Protocol Buffers**
   - Binary serialization
   - API schemas

6. **gRPC**
   - High-performance RPC
   - Bidirectional streaming
   - HTTP/2 based

## 📁 Project Structure

```
maps-agent-hackathon/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── ChatInterface.tsx
│   │   │   └── MapView.tsx
│   │   ├── lib/           # Utilities
│   │   │   └── parse-places.ts
│   │   └── pages/         # Page components
│   │       └── Home.tsx
│   └── index.html
├── server/                # Node.js backend
│   ├── adk-agent.ts      # Python agent wrapper
│   └── routers.ts        # tRPC routes
├── maps_agent/           # Python ADK agent
│   ├── agent.py          # Agent definition
│   ├── runner.py         # CLI runner
│   └── *.json            # GCP credentials
├── Dockerfile            # Cloud Run deployment
├── .dockerignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- Python 3.11+
- pnpm
- Google Cloud Project with:
  - Vertex AI API enabled
  - Maps JavaScript API enabled
  - Generative Language API enabled

### Installation

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Install Python packages**
   ```bash
   pip install google-genai google-adk
   ```

3. **Set up environment variables**
   Create `.env` file:
   ```env
   GOOGLE_CLOUD_PROJECT=your-project-id
   GOOGLE_CLOUD_LOCATION=us-central1
   GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
   VITE_GOOGLE_MAPS_API_KEY=your-maps-api-key
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Open browser**
   Navigate to `http://localhost:3000`

## 💡 Usage

### Example Queries

- "Find wheelchair accessible cafes in San Francisco"
- "Show me accessible restaurants near Times Square"
- "Are there any accessible parks in Kyiv?"

### Response Format

The agent provides:
- **Place name** and address
- **Accessibility features** (entrance, restroom, seating, parking)
- **Google Maps link** for navigation
- **Visual markers** on the map

## 🐳 Docker Deployment

### Build Image

```bash
docker build -t maps-agent .
```

### Run Container

```bash
docker run -p 8080:8080 \
  -e GOOGLE_CLOUD_PROJECT=your-project \
  -e GOOGLE_APPLICATION_CREDENTIALS=/app/credentials/key.json \
  -v /path/to/credentials.json:/app/credentials/key.json \
  maps-agent
```

### Deploy to Cloud Run

```bash
gcloud run deploy maps-agent \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=your-project
```

## 🔧 Configuration

### Agent Configuration

Edit `maps_agent/agent.py` to customize:
- Agent instructions
- Model selection (default: gemini-2.0-flash-exp)
- Tool configuration

### Frontend Configuration

Edit `client/src/pages/Home.tsx` to customize:
- Default map center
- Map zoom level
- UI styling

## 📊 API Reference

### tRPC Endpoints

#### `agent.query`

Query the accessibility agent.

**Input:**
```typescript
{
  query: string;      // User query
  sessionId?: string; // Optional session ID
}
```

**Output:**
```typescript
{
  success: boolean;
  response: string;   // Agent response
  sessionId: string;  // Session ID
}
```

## 🧪 Testing

### Manual Testing

1. Start dev server: `pnpm dev`
2. Open browser to `http://localhost:3000`
3. Enter query: "Find wheelchair accessible cafes in San Francisco"
4. Verify:
   - Agent responds with place list
   - Map shows markers
   - Accessibility features displayed

### Python Agent Testing

```bash
cd maps_agent
python3.11 runner.py "Find accessible cafes in SF" test_session
```

## 🐛 Known Issues

### Geocoding Markers

**Issue:** Map markers appear scattered globally instead of locally.

**Cause:** Google Geocoding API may not accurately geocode all addresses.

**Workaround:** Use Place Details API to get coordinates directly from `place_id`.

**Fix:**
```typescript
// In parse-places.ts
async function getPlaceDetails(placeId: string, apiKey: string) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${apiKey}`
  );
  const data = await response.json();
  return data.result.geometry.location;
}
```

## 📝 Development Notes

### Memory Bank Limitation

Google ADK Memory Bank cannot be used with `google_maps_grounding` due to Gemini API limitations. The model can use either:
- Multiple search tools, OR
- One regular tool

For conversation history, implement database-backed storage instead.

### ES Modules

The project uses ES modules. Use `import.meta.url` and `fileURLToPath` instead of `__dirname`:

```typescript
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Google ADK** - Agent Development Kit
- **Google Maps Platform** - Maps and Places APIs
- **Vertex AI** - Gemini models
- **Manus** - Development platform

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Contact: https://help.manus.im

## 🔗 Links

- [Google ADK Documentation](https://google.github.io/adk-docs/)
- [Google Maps Platform](https://developers.google.com/maps)
- [Vertex AI](https://cloud.google.com/vertex-ai)
- [tRPC](https://trpc.io/)

---

**Built with ❤️ for accessibility**
