"""
FastAPI WebSocket server for voice streaming with Gemini Live API
Handles bidirectional audio streaming between client and ADK agent
"""

import asyncio
import base64
import json
import logging
from typing import AsyncGenerator

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from streaming_agent import streaming_agent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(title="Maps Agent Voice API")

# Initialize ADK components
session_service = InMemorySessionService()
runner = Runner(
    app_name="maps_agent_voice",
    agent=streaming_agent,
    session_service=session_service
)

# Active sessions
active_sessions = {}


@app.websocket("/ws/voice")
async def voice_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for bidirectional voice streaming
    
    Protocol:
    Client -> Server:
    {
        "type": "audio",
        "data": "<base64_pcm_audio>",  # 16-bit PCM, 16kHz
        "session_id": "user_session_123"
    }
    {
        "type": "text",
        "text": "Find accessible cafes",
        "session_id": "user_session_123"
    }
    
    Server -> Client:
    {
        "type": "audio",
        "data": "<base64_pcm_audio>"
    }
    {
        "type": "text",
        "text": "I found 5 accessible cafes..."
    }
    {
        "type": "tool_call",
        "tool": "google_maps_grounding",
        "status": "executing"
    }
    {
        "type": "places",
        "places": [...]  # Parsed place data
    }
    """
    await websocket.accept()
    logger.info("WebSocket connection established")
    
    session_id = None
    user_id = "voice_user"
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            message_type = data.get("type")
            session_id = data.get("session_id", "default")
            
            # Create session if it doesn't exist
            if session_id not in active_sessions:
                logger.info(f"Creating new session: {session_id}")
                session = session_service.create_session_sync(
                    app_name="maps_agent",
                    user_id=user_id,
                    session_id=session_id
                )
                active_sessions[session_id] = session
            
            # Handle audio input
            if message_type == "audio":
                audio_data = data.get("data")  # Base64 encoded PCM
                if audio_data:
                    # Decode base64 to bytes
                    audio_bytes = base64.b64decode(audio_data)
                    
                    # Create audio content for Gemini
                    audio_content = types.Content(
                        parts=[types.Part(
                            inline_data=types.Blob(
                                mime_type="audio/pcm;rate=16000",
                                data=audio_bytes
                            )
                        )]
                    )
                    
                    # Stream to agent and get responses
                    async for response in stream_to_agent(
                        session_id=session_id,
                        user_id=user_id,
                        content=audio_content,
                        websocket=websocket
                    ):
                        await websocket.send_json(response)
            
            # Handle text input
            elif message_type == "text":
                text = data.get("text")
                if text:
                    # Create text content
                    text_content = types.Content(
                        parts=[types.Part(text=text)]
                    )
                    
                    # Stream to agent and get responses
                    async for response in stream_to_agent(
                        session_id=session_id,
                        user_id=user_id,
                        content=text_content,
                        websocket=websocket
                    ):
                        await websocket.send_json(response)
            
            # Handle session management
            elif message_type == "ping":
                await websocket.send_json({"type": "pong"})
            
            elif message_type == "close":
                logger.info(f"Client requested close for session: {session_id}")
                break
    
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session: {session_id}")
    except Exception as e:
        logger.error(f"Error in WebSocket: {e}", exc_info=True)
        await websocket.send_json({
            "type": "error",
            "error": str(e)
        })
    finally:
        # Cleanup session
        if session_id and session_id in active_sessions:
            del active_sessions[session_id]
            logger.info(f"Cleaned up session: {session_id}")


async def stream_to_agent(
    session_id: str,
    user_id: str,
    content: types.Content,
    websocket: WebSocket
) -> AsyncGenerator[dict, None]:
    """
    Stream content to agent and yield responses
    
    Yields:
        dict: Response messages for the client
    """
    try:
        # Run agent with streaming
        async for event in runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=content
        ):
            # Handle different event types
            if hasattr(event, 'content'):
                for part in event.content.parts:
                    # Text response
                    if hasattr(part, 'text') and part.text:
                        yield {
                            "type": "text",
                            "text": part.text
                        }
                    
                    # Audio response
                    if hasattr(part, 'inline_data') and part.inline_data:
                        if part.inline_data.mime_type.startswith('audio/'):
                            # Encode audio to base64
                            audio_base64 = base64.b64encode(
                                part.inline_data.data
                            ).decode('utf-8')
                            
                            yield {
                                "type": "audio",
                                "data": audio_base64
                            }
            
            # Tool call events
            if hasattr(event, 'tool_call'):
                tool_name = event.tool_call.name if hasattr(event.tool_call, 'name') else 'unknown'
                yield {
                    "type": "tool_call",
                    "tool": tool_name,
                    "status": "executing"
                }
            
            # Tool response events
            if hasattr(event, 'tool_response'):
                # Try to parse places from tool response
                try:
                    if hasattr(event.tool_response, 'content'):
                        # Extract place data if available
                        yield {
                            "type": "tool_response",
                            "tool": "google_maps_grounding",
                            "status": "completed"
                        }
                except Exception as e:
                    logger.warning(f"Could not parse tool response: {e}")
    
    except Exception as e:
        logger.error(f"Error streaming to agent: {e}", exc_info=True)
        yield {
            "type": "error",
            "error": str(e)
        }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "active_sessions": len(active_sessions)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
