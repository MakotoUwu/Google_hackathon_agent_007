# 🗺️ Maps Agent with Google ADK
## Hackathon Presentation

---

## 🎯 Problem Statement

**People with mobility challenges face daily obstacles:**
- Finding wheelchair-accessible places is difficult
- No easy way to verify accessibility features
- Route planning doesn't consider accessibility needs
- Information is scattered across multiple sources

**Our Solution:** An AI-powered assistant that makes accessibility information instantly accessible through natural conversation.

---

## 💡 Solution Overview

**Maps Agent** is an intelligent accessibility assistant powered by Google ADK that:

✅ **Understands natural language** - Ask in plain English  
✅ **Finds accessible places** - Real-time data from Google Maps  
✅ **Provides detailed info** - Entrance, restroom, seating, parking accessibility  
✅ **Plans routes** - Considers accessibility throughout the journey  
✅ **Voice-enabled** - Hands-free interaction with Gemini Live API  

---

## 🏗️ Technical Architecture

### Core Technologies

**Google ADK (Agent Development Kit)**
- Orchestrates the entire agent workflow
- Manages sessions and state
- Handles tool execution

**Gemini 2.0 Flash** (via Vertex AI)
- Natural language understanding
- Function calling for tools
- Streaming responses

**google_maps_grounding Tool**
- Direct integration with Google Maps
- Real-time place data
- Accessibility information

**Full-Stack Application**
- **Frontend**: React + TypeScript + Google Maps JavaScript API
- **Backend**: Node.js + tRPC + Python ADK
- **Database**: PostgreSQL (for user preferences)
- **Deployment**: Google Cloud Run

### Data Flow

```
User Query
    ↓
Frontend (React)
    ↓
tRPC API (Node.js)
    ↓
Python ADK Agent
    ↓
Vertex AI (Gemini 2.0)
    ↓
google_maps_grounding Tool
    ↓
Google Maps Platform APIs
    ↓
Structured Response
    ↓
Map Visualization
```

---

## 🎨 Key Features

### 1. **Natural Language Search**
```
"Find wheelchair accessible cafes in San Francisco"
"Show me restaurants with accessible restrooms near me"
"Where can I get coffee with accessible parking?"
```

### 2. **Detailed Accessibility Information**
- ♿ Wheelchair accessible entrance
- 🚻 Accessible restrooms
- 🪑 Accessible seating
- 🅿️ Accessible parking
- 📍 Exact locations with Google Maps links

### 3. **Interactive Map**
- Real-time marker placement
- Click for detailed info
- Direct navigation links
- Cluster view for many results

### 4. **Voice Mode** (Beta)
- Hands-free interaction
- Gemini Live API integration
- Real-time audio streaming
- Natural conversation flow

### 5. **Route Planning** (Coming Soon)
- Multi-stop accessible routes
- Turn-by-turn directions
- Accessibility verification along route
- Alternative route suggestions

---

## 🔧 Technical Highlights

### Google ADK Integration

**Agent Definition:**
```python
agent = Agent(
    model="gemini-2.0-flash-exp",
    tools=[google_maps_grounding],
    system_instruction="""
    You are an accessibility-focused maps assistant.
    Help users find wheelchair-accessible places with 
    detailed accessibility information.
    """
)
```

**Tool Configuration:**
```python
google_maps_grounding = GoogleMapsGroundingTool(
    google_search_retrieval=GoogleSearchRetrieval(
        dynamic_retrieval_config=DynamicRetrievalConfig(
            mode=Mode.MODE_DYNAMIC,
            dynamic_threshold=0.7
        )
    )
)
```

### Architecture Diagram

See `docs/detailed-architecture.png` for complete system architecture showing:
- All Google Cloud services used
- API interactions and protocols
- Data flow between components
- Authentication and security

---

## 📊 Demo Scenarios

### Scenario 1: Quick Coffee Stop
**User:** "Find wheelchair accessible cafes near Golden Gate Park"

**Agent Response:**
- Lists 15+ accessible cafes
- Shows on map with markers
- Provides accessibility details
- Includes Google Maps links

### Scenario 2: Planning a Day Out
**User:** "I need an accessible restaurant for lunch and a museum for the afternoon"

**Agent Response:**
- Suggests accessible restaurants
- Finds nearby accessible museums
- Can plan route between them
- Considers accessibility throughout

### Scenario 3: Voice Interaction
**User:** *Speaks* "Where's the nearest accessible restroom?"

**Agent:** *Responds with voice* "I found 3 locations within 5 minutes..."
- Hands-free operation
- Natural conversation
- Real-time responses

---

## 🚀 Innovation & Impact

### Technical Innovation

1. **First-class ADK Integration**
   - Leverages latest Google ADK features
   - Demonstrates google_maps_grounding tool
   - Shows best practices for agent development

2. **Seamless Multi-Modal**
   - Text and voice interfaces
   - Real-time streaming
   - Interactive visualizations

3. **Production-Ready**
   - Deployed on Cloud Run
   - Scalable architecture
   - Proper error handling

### Social Impact

1. **Accessibility First**
   - Designed for people with mobility challenges
   - Makes information instantly accessible
   - Reduces barriers to exploration

2. **Inclusive Design**
   - Voice mode for hands-free use
   - Clear visual indicators
   - Simple, intuitive interface

3. **Real-World Utility**
   - Solves actual daily problems
   - Uses verified Google Maps data
   - Continuously updated information

---

## 📈 Future Enhancements

### Short Term (Next Sprint)
- [ ] Complete route planning with Directions API
- [ ] Save favorite places to database
- [ ] User preference profiles
- [ ] Offline mode with cached data

### Medium Term (Next Month)
- [ ] Community reviews and ratings
- [ ] Photo verification of accessibility
- [ ] Real-time crowdsourced updates
- [ ] Integration with transit APIs

### Long Term (Vision)
- [ ] AR navigation overlay
- [ ] Predictive suggestions based on history
- [ ] Social features (share routes)
- [ ] Multi-language support
- [ ] Integration with smart city infrastructure

---

## 💻 Technical Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **AI/ML** | Gemini 2.0 Flash | Natural language understanding |
| **Agent Framework** | Google ADK | Agent orchestration |
| **Maps** | Google Maps Platform | Place data & visualization |
| **Backend** | Node.js + Python | API & agent runtime |
| **Frontend** | React + TypeScript | User interface |
| **Database** | PostgreSQL | User data & preferences |
| **Deployment** | Cloud Run | Serverless hosting |
| **Build** | Cloud Build | CI/CD pipeline |
| **Auth** | OAuth 2.0 + JWT | User authentication |

---

## 🏆 Why This Project Stands Out

### 1. **Cutting-Edge Technology**
- Uses latest Gemini 2.0 model
- Implements Google ADK best practices
- Demonstrates advanced tool integration

### 2. **Real-World Problem**
- Addresses actual accessibility challenges
- Uses verified, real-time data
- Provides immediate value

### 3. **Production Quality**
- Fully deployed and accessible
- Proper error handling
- Scalable architecture
- Comprehensive documentation

### 4. **User-Centric Design**
- Multiple interaction modes (text/voice)
- Clear, actionable information
- Intuitive interface
- Accessibility-first approach

### 5. **Extensible Foundation**
- Modular architecture
- Easy to add new features
- Well-documented codebase
- Ready for community contributions

---

## 🔗 Resources

- **Live Demo**: [Cloud Run URL]
- **Source Code**: `/home/ubuntu/maps-agent-hackathon`
- **Architecture Diagram**: `docs/detailed-architecture.png`
- **Deployment Guide**: `DEPLOYMENT.md`
- **API Documentation**: `README.md`

---

## 👥 Team & Acknowledgments

**Built with:**
- Google ADK (Agent Development Kit)
- Gemini 2.0 Flash (Vertex AI)
- Google Maps Platform
- Google Cloud Run
- Manus Development Environment

**Special Thanks:**
- Google Cloud team for amazing tools
- Google Maps Platform for accessibility data
- Hackathon organizers

---

## 🎤 Q&A

**Common Questions:**

**Q: How accurate is the accessibility information?**  
A: Data comes directly from Google Maps, which aggregates information from businesses, users, and Google's own verification processes.

**Q: Can this work in other cities/countries?**  
A: Yes! google_maps_grounding works globally wherever Google Maps has data.

**Q: How much does it cost to run?**  
A: Cloud Run free tier covers ~10K requests/month. Gemini API costs ~$0.50-2 per 1M tokens. Maps API has 28K free map loads/month.

**Q: Is the code open source?**  
A: The project is available for review and can be open-sourced after the hackathon.

**Q: Can I add my own accessibility reviews?**  
A: This feature is planned! Users will be able to contribute verified accessibility information.

---

## 🎯 Call to Action

**Try it now:**
1. Visit the live demo
2. Ask about accessible places in your city
3. Try voice mode
4. Explore the map

**Get involved:**
- Star the repository
- Report issues or suggest features
- Contribute accessibility data
- Share with friends who need it

---

# Thank You! 🙏

**Making the world more accessible, one query at a time.**

---

*Presentation prepared for Google ADK Hackathon 2025*
