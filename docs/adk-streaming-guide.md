# ADK Streaming (Bidi-streaming) Implementation Guide

Based on official Google ADK documentation: https://google.github.io/adk-docs/get-started/streaming/quickstart-streaming/

## Overview

ADK Streaming enables low-latency bidirectional voice and video interaction with Gemini Live API for AI agents.

**Key Features:**
- Natural, human-like voice conversations
- User can interrupt agent's responses
- Process text, audio, and video inputs
- Provide text and audio output
- Real-time streaming

## Supported Models

Models that support Gemini Live API:
- `gemini-2.0-flash-live-001`
- `gemini-2.0-flash-live-preview-04-09`

Documentation:
- Google AI Studio: https://ai.google.dev/gemini-api/docs/live
- Vertex AI: https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/multimodal-live

## Basic Agent Setup

```python
from google.adk.agents import Agent
from google.adk.tools import google_search, google_maps_grounding

root_agent = Agent(
    name="maps_accessibility_agent",
    model="gemini-2.0-flash-live-001",  # Live API model
    description="Agent to find accessible places using voice",
    instruction="You are an accessibility expert. Help users find wheelchair-accessible places.",
    tools=[google_maps_grounding]  # Can use tools with streaming!
)
```

## Running with ADK Web (Dev UI)

```bash
# Set SSL cert for voice/video
export SSL_CERT_FILE=$(python -m certifi)

# Launch dev UI
adk web

# Open http://localhost:8000 in browser
# Click microphone for voice input
# Click camera for video input
```

## Custom Streaming App Architecture

For production, build custom app with FastAPI + ADK Streaming:

### Server Side (Python + FastAPI)

```python
from fastapi import FastAPI, WebSocket
from google.adk.streaming import LiveRequestQueue
from google.adk.agents import Agent

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    # Create live request queue
    queue = LiveRequestQueue()
    
    # Stream audio/video from client
    async for message in websocket.iter_json():
        if message["type"] == "audio":
            # Add audio to queue
            queue.add_audio(message["data"])
        elif message["type"] == "text":
            queue.add_text(message["text"])
    
    # Stream responses back to client
    async for response in agent.stream(queue):
        if response.audio:
            await websocket.send_json({
                "type": "audio",
                "data": response.audio
            })
        if response.text:
            await websocket.send_json({
                "type": "text",
                "text": response.text
            })
```

### Client Side (React + Web Audio API)

```typescript
// 1. Capture audio from microphone
const audioContext = new AudioContext();
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const source = audioContext.createMediaStreamSource(stream);

// 2. Process audio with AudioWorklet (PCM conversion)
await audioContext.audioWorklet.addModule('audio-processor.js');
const processor = new AudioWorkletNode(audioContext, 'audio-processor');

// 3. Send to WebSocket
processor.port.onmessage = (event) => {
  ws.send(JSON.stringify({
    type: 'audio',
    data: event.data  // Base64 PCM audio
  }));
};

// 4. Receive and play audio responses
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'audio') {
    playAudio(message.data);  // Use AudioStreamer
  }
};
```

## Audio Format Requirements

**Input (Client → Server):**
- Format: PCM (Pulse-Code Modulation)
- Bit depth: 16-bit
- Sample rate: 16000 Hz
- Encoding: Base64
- MIME type: `audio/pcm;rate=16000`

**Output (Server → Client):**
- Same format as input
- Decode Base64 → Convert to Float32 → Play via Web Audio API

## Best Practices

### 1. Audio Processing
- Use AudioWorklet (not ScriptProcessor - deprecated)
- Run in separate thread for performance
- Buffer audio chunks before sending

### 2. Error Handling
```python
try:
    async for response in agent.stream(queue):
        # Handle response
        pass
except Exception as e:
    logger.error(f"Streaming error: {e}")
    # Reconnect logic
```

### 3. Session Management
```python
# Create session for conversation context
session = runner.create_session(
    session_id="user_123",
    user_id="user_123"
)

# Use session with streaming
async for response in agent.stream(queue, session=session):
    # Responses maintain context
    pass
```

### 4. Tool Integration
- Tools work with streaming!
- `google_maps_grounding` can be used
- Tool calls happen during conversation
- Results streamed back in real-time

### 5. Interruption Handling
- User can interrupt agent mid-response
- Send new audio while agent is speaking
- Agent stops and processes new input

## Limitations (Current)

Not yet supported in ADK Streaming:
- Callbacks
- LongRunningTool
- ExampleTool
- Workflow agents (SequentialAgent, LoopAgent, etc.)

## Implementation Steps for Our Project

1. **Backend: Create FastAPI streaming endpoint**
   - `/ws/voice` WebSocket endpoint
   - Handle audio input/output
   - Integrate with existing ADK agent

2. **Frontend: Add voice UI components**
   - Microphone button
   - Audio recording with Web Audio API
   - AudioWorklet for PCM conversion
   - WebSocket client
   - Audio playback with AudioStreamer

3. **Integration with Maps**
   - Voice query → ADK agent → google_maps_grounding
   - Parse results → Display on map
   - Voice output with place information

4. **Testing**
   - Test with `adk web` first
   - Build custom UI
   - Test interruptions
   - Test tool calling during voice conversation

## Resources

- Official Quickstart: https://google.github.io/adk-docs/get-started/streaming/quickstart-streaming/
- Custom Audio App (SSE): https://google.github.io/adk-docs/streaming/custom-audio-streaming-sse/
- Custom Audio App (WebSockets): https://google.github.io/adk-docs/streaming/custom-audio-streaming-websockets/
- Gemini Live API: https://ai.google.dev/gemini-api/docs/live
- Blog Post: https://cloud.google.com/blog/products/ai-machine-learning/build-a-real-time-voice-agent-with-gemini-adk
