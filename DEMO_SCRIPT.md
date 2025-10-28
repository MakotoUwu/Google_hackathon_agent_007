# 🎬 Demo Script - Maps Agent Hackathon

## 🎯 Demo Flow (5 minutes)

### Introduction (30 seconds)

> "Hi everyone! I'm excited to show you **Maps Agent** - an AI-powered accessibility assistant built with Google ADK.
> 
> The problem: People with mobility challenges struggle to find accessible places and plan accessible routes.
> 
> Our solution: An intelligent agent that understands natural language and provides real-time accessibility information from Google Maps."

---

### Demo 1: Text-Based Search (90 seconds)

**Action:** Open the live application

> "Let me show you how it works. Here's our interface - a chat on the left, an interactive map on the right."

**Type in chat:** `Find wheelchair accessible cafes in San Francisco`

> "I'm asking the agent in plain English to find accessible cafes. Behind the scenes:
> 1. The query goes to our Node.js backend via tRPC
> 2. Python ADK agent processes it
> 3. Gemini 2.0 understands the intent
> 4. Calls google_maps_grounding tool
> 5. Returns structured data with accessibility features"

**Point to results:**

> "Look at the results! The agent found 20 wheelchair-accessible cafes and shows:
> - ♿ Wheelchair accessible entrance
> - 🚻 Accessible restrooms  
> - 🪑 Accessible seating
> - 🅿️ Accessible parking
> 
> Each place has a direct Google Maps link for navigation."

**Point to map:**

> "And here on the map, you can see all the locations marked. Click any marker to see details."

---

### Demo 2: Voice Mode (90 seconds)

**Action:** Click the microphone button in Voice Mode section

> "Now, the really cool part - **Voice Mode** powered by Gemini Live API.
> 
> This enables hands-free interaction, which is crucial for accessibility."

**Speak into microphone:** `Where's the nearest accessible restaurant?`

> "Notice how it:
> 1. Captures my voice in real-time
> 2. Streams audio to Gemini Live API
> 3. The agent responds with voice
> 4. Shows results on the map simultaneously
> 
> This is true bidirectional streaming - I can even interrupt the agent mid-response!"

**Point to transcription:**

> "You can see the transcription here, and the agent is speaking the response back to me."

---

### Demo 3: Architecture Deep Dive (60 seconds)

**Action:** Show architecture diagram

> "Let me quickly show you the technical architecture.
> 
> **Frontend:**
> - React + TypeScript
> - Google Maps JavaScript API
> - Web Audio API for voice
> 
> **Backend:**
> - Node.js with tRPC for type-safe APIs
> - Python ADK agent runtime
> - FastAPI WebSocket for voice streaming
> 
> **Google Cloud:**
> - Vertex AI for Gemini 2.0
> - google_maps_grounding tool
> - Cloud Run for deployment
> - PostgreSQL for user data
> 
> The key innovation is the **google_maps_grounding tool** - it gives Gemini direct access to Google Maps data with accessibility information."

---

### Demo 4: Real-World Use Case (60 seconds)

**Type in chat:** `I need an accessible restaurant for lunch and a museum for the afternoon in downtown SF`

> "This is a more complex query - planning a day out.
> 
> The agent understands:
> 1. Two different place types (restaurant + museum)
> 2. Time context (lunch + afternoon)
> 3. Location (downtown SF)
> 4. Accessibility requirement (implicit)
> 
> And it returns relevant results for both, showing them on the map."

**Point to results:**

> "Now I can plan my entire day knowing that every place is accessible. I can click through to get directions, check hours, read reviews."

---

### Closing & Future Vision (60 seconds)

> "So that's Maps Agent! Let me highlight what makes this special:
> 
> **Technical Innovation:**
> - First-class Google ADK integration
> - Demonstrates google_maps_grounding best practices
> - Production-ready deployment on Cloud Run
> 
> **Social Impact:**
> - Solves real accessibility challenges
> - Makes information instantly accessible
> - Reduces barriers to exploration
> 
> **Future Enhancements:**
> - Complete route planning with turn-by-turn directions
> - Community reviews and photo verification
> - AR navigation overlay
> - Multi-language support
> 
> The code is fully documented, deployed, and ready to use. Thank you!"

---

## 🎤 Q&A Preparation

### Technical Questions

**Q: How does google_maps_grounding work?**
> "It's a specialized tool in Google ADK that gives Gemini direct access to Google Maps Platform APIs. When the agent needs place information, it calls this tool with the query, and Google Maps returns structured data including accessibility features. This is more reliable than web scraping or using generic search."

**Q: What's the latency for voice mode?**
> "With Gemini Live API, we achieve near real-time latency - typically 200-500ms from speech to response start. This is because it uses WebSocket streaming and processes audio chunks incrementally rather than waiting for complete sentences."

**Q: How do you handle errors or unavailable data?**
> "We have multiple fallback layers:
> 1. If google_maps_grounding fails, we show a friendly error
> 2. If accessibility data is missing, we clearly indicate 'unknown'
> 3. If geocoding fails, we still show text results
> 4. All errors are logged to Cloud Logging for monitoring"

**Q: Can this scale to many users?**
> "Yes! Cloud Run auto-scales based on traffic. Each container can handle ~100 concurrent requests. Gemini API has rate limits but they're quite generous. For production, we'd add:
> - Redis caching for frequent queries
> - Database connection pooling
> - CDN for static assets
> - Rate limiting per user"

### Product Questions

**Q: How accurate is the accessibility information?**
> "The data comes from Google Maps, which aggregates:
> - Business-provided information
> - User-contributed reviews and photos
> - Google's own verification (Street View, etc.)
> 
> It's the most comprehensive accessibility dataset available. We're also planning to add community verification features."

**Q: Can users contribute their own data?**
> "That's on our roadmap! We want to enable:
> - Photo uploads with accessibility highlights
> - Detailed reviews of specific features
> - Real-time updates (e.g., 'elevator out of order')
> - Verification badges for trusted contributors"

**Q: What about privacy?**
> "We take privacy seriously:
> - Voice data is streamed directly to Gemini, not stored
> - User queries are logged only for debugging (can be disabled)
> - Location data is never stored without consent
> - All communication is encrypted (HTTPS/WSS)
> - Compliant with GDPR and accessibility regulations"

### Business Questions

**Q: What's the cost to run this?**
> "For moderate usage (~10K requests/month):
> - Cloud Run: ~$5-10/month (free tier covers most)
> - Gemini API: ~$1-5/month (pay per token)
> - Maps API: Free (28K map loads/month free tier)
> - Total: ~$10-20/month to start
> 
> Costs scale linearly with usage, making it very affordable."

**Q: Who is the target audience?**
> "Primary: People with mobility challenges (wheelchair users, elderly, etc.)
> 
> Secondary:
> - Caregivers and family members
> - Accessibility advocates
> - Urban planners
> - Businesses wanting to verify their accessibility
> 
> Potential reach: 61 million adults in the US with mobility disabilities."

**Q: How would you monetize this?**
> "Possible models:
> 1. **Freemium**: Basic free, premium features (route planning, offline mode)
> 2. **B2B**: Sell to businesses for accessibility audits
> 3. **API**: Offer accessibility data API to other apps
> 4. **Partnerships**: Work with cities/transit agencies
> 5. **Grants**: Accessibility-focused non-profit funding"

---

## 📋 Pre-Demo Checklist

### 30 Minutes Before

- [ ] Test live deployment URL
- [ ] Verify Google Maps loads correctly
- [ ] Test a sample query (text)
- [ ] Test voice mode (if available)
- [ ] Check microphone permissions
- [ ] Open architecture diagram in separate tab
- [ ] Have backup screenshots ready
- [ ] Test internet connection
- [ ] Close unnecessary browser tabs
- [ ] Disable notifications

### 5 Minutes Before

- [ ] Open live demo in full screen
- [ ] Clear chat history
- [ ] Reset map to San Francisco
- [ ] Test microphone one more time
- [ ] Have water ready
- [ ] Take a deep breath 😊

### During Demo

- [ ] Speak clearly and at moderate pace
- [ ] Point to UI elements as you explain
- [ ] Show enthusiasm!
- [ ] Make eye contact with audience
- [ ] Be ready to adapt if something breaks
- [ ] Have fun!

---

## 🎭 Backup Plan

### If Live Demo Fails

1. **Show screenshots** from previous successful run
2. **Walk through code** - show agent.py and explain
3. **Show architecture diagram** - explain data flow
4. **Play pre-recorded video** (if available)
5. **Explain what would happen** - describe expected behavior

### If Voice Mode Fails

- Skip to text-based demo
- Explain voice mode conceptually
- Show code for WebSocket streaming
- Mention it's beta feature

### If Internet is Slow

- Use cached/local version if available
- Show local development environment
- Focus on code walkthrough
- Emphasize architecture over live demo

---

## 🌟 Key Messages to Emphasize

1. **Accessibility First** - Built for real people with real needs
2. **Google ADK Best Practices** - Demonstrates proper tool integration
3. **Production Ready** - Fully deployed, not just a prototype
4. **Extensible** - Easy to add new features and tools
5. **Social Impact** - Makes the world more accessible

---

## 🎯 Success Metrics

**Demo is successful if audience understands:**
- ✅ The problem we're solving
- ✅ How Google ADK enables the solution
- ✅ The technical architecture
- ✅ Real-world applicability
- ✅ Future potential

**Bonus points for:**
- 🌟 Audience asks technical questions
- 🌟 Someone wants to try it themselves
- 🌟 Judges mention it in feedback
- 🌟 Other teams ask about implementation

---

Good luck! 🍀 You've got this! 💪
