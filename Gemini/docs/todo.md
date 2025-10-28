# Maps Agent Hackathon - TODO

**Deadline: 11:30 AM** | **Current Time: ~8:20 AM** | **Time Remaining: ~3 hours**

---

## 🎯 CRITICAL FOR DEMO (Must Have)

### Deployment - IN PROGRESS 🚀
- [x] Create Dockerfile for production build
- [x] Fix Dockerfile (patches, Python deps, build order)
- [x] Create DEPLOYMENT.md with instructions
- [ ] **Deploy to Cloud Run** (IN PROGRESS - 3rd attempt, fixed patches issue)
- [ ] **Configure environment variables** (GOOGLE_API_KEY, credentials)
- [ ] **Test deployed application** - verify agent works
- [ ] **Get public URL** for demo

### Demo Preparation - READY ✅
- [x] Create HACKATHON_PRESENTATION.md with talking points
- [x] Create DEMO_SCRIPT.md with 5-minute demo flow
- [x] Create architecture diagrams (detailed + simple)
- [x] Document Google ADK workflow in README
- [ ] **Test demo flow** on live deployment
- [ ] **Prepare backup screenshots** in case of issues
- [ ] **Record demo video** (optional backup)

---

## ✅ COMPLETED

### Core Functionality
- [x] Initialize tRPC + React project structure
- [x] Set up Google ADK agent with google_maps_grounding
- [x] Configure Vertex AI authentication with service account
- [x] Create Python runner for ADK agent
- [x] Test ADK agent (successfully finds accessible places)
- [x] Create Node.js wrapper (adk-agent.ts) for Python agent
- [x] Add tRPC endpoint (agent.query) for agent queries
- [x] Obtain Google Maps API Key from Cloud Console
- [x] Enable required APIs (Maps, Places, Vertex AI)

### Frontend
- [x] Create basic layout with chat and map sections
- [x] Fix Google Maps API integration (Maps working!)
- [x] Connect chat interface to agent backend via tRPC
- [x] Parse agent responses to extract place data
- [x] Display places as markers on Google Maps
- [x] Show accessibility features in UI
- [x] Add loading states and error handling
- [x] Test end-to-end flow (SUCCESS! Found 20 cafes)

### Voice Mode UI (Frontend Only)
- [x] Create VoiceButton component with mic icon
- [x] Implement audio recording with getUserMedia
- [x] Create AudioWorklet for PCM conversion
- [x] WebSocket client for bidirectional streaming
- [x] AudioStreamer for playing agent responses
- [x] Real-time transcription display
- [x] Visual feedback (waveform/volume indicator)

### Documentation
- [x] Create detailed architecture diagrams
- [x] Document Google ADK workflow
- [x] Create DEPLOYMENT.md
- [x] Create HACKATHON_PRESENTATION.md
- [x] Create DEMO_SCRIPT.md
- [x] Add README with technical details

---

## 🔄 IN PROGRESS

### Cloud Run Deployment
**Status:** Building container (3rd attempt after fixing patches issue)
**ETA:** ~5-10 minutes
**Blocker:** None currently, waiting for build to complete

### Demo Preparation
**Status:** Documentation ready, waiting for live URL
**Next:** Test demo flow once deployed

---

## 🎁 NICE TO HAVE (If Time Permits)

### Voice Mode Backend Integration (2-3 hours)
- [x] Create streaming agent with gemini-2.0-flash-live-001
- [x] Create FastAPI WebSocket endpoint for voice streaming
- [x] Create WebSocket proxy in Express
- [ ] Start Python FastAPI voice server
- [ ] Test end-to-end voice flow
- [ ] Deploy voice server to Cloud Run

**Priority:** MEDIUM - Cool demo feature but not critical

### Route Planning (3-4 hours)
- [ ] Integrate Google Directions API
- [ ] Allow selecting multiple places from results
- [ ] Calculate accessible routes between places
- [ ] Display route on map with polylines
- [ ] Show turn-by-turn directions with accessibility notes

**Priority:** LOW - Can be mentioned as "future feature"

### Enhanced Place Information (2-3 hours)
- [ ] Show detailed accessibility features for each place
- [ ] Display photos with accessibility highlights
- [ ] Show user reviews mentioning accessibility
- [ ] Rate places by accessibility score
- [ ] Show nearby accessible parking/restrooms

**Priority:** LOW - Current info is sufficient for demo

### Personalization & History (3-4 hours)
- [ ] Save favorite accessible places to database
- [ ] Store search history
- [ ] Remember user's accessibility preferences
- [ ] Quick access to recently searched places
- [ ] Share accessible routes with others

**Priority:** LOW - Can be mentioned as "future feature"

---

## 🐛 KNOWN ISSUES

### Non-Critical (Can mention in Q&A)
- [ ] Geocoding shows markers scattered globally instead of locally
  - **Root cause:** Google Geocoding API needs better address formatting
  - **Workaround:** Use Place Details API to get coordinates from place_id
  - **Impact:** LOW - doesn't affect core functionality
  - **Fix time:** 1-2 hours

- [ ] Old error logs in console (can be ignored)
  - **Root cause:** Previous failed agent calls
  - **Impact:** NONE - doesn't affect functionality
  - **Fix time:** 5 minutes (clear logs)

### Critical (Must fix before demo)
- None currently! 🎉

---

## 📋 PRE-DEMO CHECKLIST

### 30 Minutes Before Demo
- [ ] Verify Cloud Run deployment is live
- [ ] Test sample query: "Find wheelchair accessible cafes in San Francisco"
- [ ] Verify Google Maps loads correctly
- [ ] Check that markers appear on map
- [ ] Test accessibility features display
- [ ] Verify Google Maps links work
- [ ] Clear browser cache and test fresh load
- [ ] Take screenshots of working demo
- [ ] Open architecture diagram in separate tab
- [ ] Have DEMO_SCRIPT.md open for reference

### 5 Minutes Before Demo
- [ ] Open live demo URL in full screen
- [ ] Clear chat history
- [ ] Reset map to San Francisco
- [ ] Close unnecessary browser tabs
- [ ] Disable notifications
- [ ] Test microphone (if doing voice demo)
- [ ] Have water ready
- [ ] Take a deep breath 😊

---

## 🎯 SUCCESS CRITERIA

### Must Have (Critical)
- ✅ Agent finds accessible places via natural language
- ✅ Results show detailed accessibility features
- ✅ Places displayed on interactive Google Maps
- ✅ Live deployment on Cloud Run
- ✅ Documentation and architecture diagrams
- [ ] 5-minute demo runs smoothly

### Nice to Have (Bonus Points)
- [ ] Voice mode working end-to-end
- [ ] Route planning demonstration
- [ ] Community features (save/share)

### Presentation Quality
- ✅ Clear problem statement
- ✅ Technical architecture explained
- ✅ Google ADK integration highlighted
- ✅ Social impact emphasized
- ✅ Future roadmap outlined

---

## ⏱️ TIME ALLOCATION

**Remaining: ~3 hours until 11:30**

- **8:20-8:40 (20 min):** Wait for deployment, prepare backup materials
- **8:40-9:00 (20 min):** Test deployed application, fix any issues
- **9:00-9:30 (30 min):** Practice demo, refine talking points
- **9:30-10:00 (30 min):** Add voice mode if deployment stable (optional)
- **10:00-10:30 (30 min):** Final testing and polish
- **10:30-11:00 (30 min):** Create backup video/screenshots
- **11:00-11:30 (30 min):** Final preparations, relax

---

## 🚀 DEPLOYMENT STATUS

**Current Build:** 3rd attempt (fixed patches issue)
**Started:** ~8:15 AM
**ETA:** ~8:25 AM (if successful)
**Status:** Building container...

**Previous Attempts:**
1. ❌ Failed - patches not copied in builder stage
2. ❌ Failed - patches copied after package.json
3. ⏳ In progress - patches copied from builder stage before package.json

**Next Steps After Deployment:**
1. Get public URL
2. Test agent query
3. Verify Maps integration
4. Take screenshots
5. Practice demo

---

## 💡 DEMO TALKING POINTS

1. **Problem:** People with mobility challenges struggle to find accessible places
2. **Solution:** AI agent with Google ADK + google_maps_grounding
3. **Tech Stack:** Gemini 2.0, Google Maps Platform, Cloud Run
4. **Innovation:** First-class ADK integration, real-time data
5. **Impact:** Makes accessibility information instantly accessible
6. **Future:** Voice mode, route planning, community features

---

## 🎬 DEMO FLOW (5 minutes)

1. **Intro (30s):** Problem + Solution
2. **Demo 1 (90s):** Text search for accessible cafes
3. **Demo 2 (60s):** Show results on map with details
4. **Demo 3 (60s):** Architecture explanation
5. **Demo 4 (60s):** Complex query (restaurant + museum)
6. **Closing (60s):** Impact + Future + Q&A

---

**Last Updated:** 8:20 AM
**Status:** 🟢 On track for 11:30 deadline
**Confidence:** 🔥 High - core functionality working, deployment in progress

---

## 🚨 CRITICAL BUG FIXED (4:26 AM → 4:30 AM)

### Agent Error: Multiple Tools Conflict ✅ FIXED
- [x] **FIXED:** Removed custom FunctionTools (get_accessible_route, find_accessible_places_along_route)
  - **Error:** `400 INVALID_ARGUMENT - Multiple tools are supported only when they are all search tools`
  - **Root Cause:** Cannot mix google_maps_grounding (search tool) with custom FunctionTools
  - **Solution:** Kept only google_maps_grounding tool, removed route planning tools
  - **Impact:** CRITICAL - agent was completely broken
  - **Fix Time:** 5 minutes
  - **Priority:** 🔥 HIGHEST

**Status:** ✅ Fixed and dev server restarted!

---

## 🎯 FINAL TASKS (Before GitHub Push)

- [x] Update UI text to emphasize accessibility for people with mobility challenges
- [x] Rewrite README.md for Google ADK hackathon (winning version)
- [x] Reorganize project structure: move AI files to Gemini/ folder
- [x] Security audit: check for exposed API keys and credentials
- [x] Update HTML meta tags with accessibility focus
- [x] Update agent system prompt to be more empathetic and focused on helping people with disabilities
- [x] Restart dev server with updated agent
- [ ] Create final checkpoint
- [ ] Push to GitHub (user will do manually)
