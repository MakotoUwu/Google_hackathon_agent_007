"""
FastAPI backend for Maps Agent with Google ADK
Based on local-explorer-assistant architecture with SSE streaming
"""
import os
import json
import uuid
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part

from maps_agent.agent import root_agent

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("maps_agent_api")

APP_NAME = "maps-agent-hackathon"
USER_ID = os.getenv("USER_ID", "default_user")

app = FastAPI(title="Maps Agent API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global runner instance
runner: Runner = None
session_service: InMemorySessionService = None


@app.on_event("startup")
async def init_runner():
    """Initialize ADK Runner with InMemorySessionService"""
    global runner, session_service
    
    logger.info("Initializing ADK Runner...")
    
    session_service = InMemorySessionService()
    
    runner = Runner(
        agent=root_agent,
        app_name=APP_NAME,
        session_service=session_service,
    )
    
    logger.info("ADK Runner initialized successfully")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "message": "Maps Agent API is running",
        "version": "1.0.0",
        "backend": "Google ADK"
    }


@app.post("/api/chat")
async def chat_stream(request: Request):
    """Streaming chat endpoint with Server-Sent Events (SSE)"""
    global runner, session_service
    
    try:
        body = await request.json()
        message = body.get("message", "")
        session_id = body.get("session_id", str(uuid.uuid4()))
        
        if not message:
            return {"error": "Message is required"}
        
        logger.info(f"Received message: {message} (session: {session_id})")
        
        # Create session if it doesn't exist
        try:
            await session_service.create_session(
                app_name=APP_NAME,
                user_id=USER_ID,
                session_id=session_id,
            )
        except Exception:
            # Session already exists, that's fine
            pass
        
        # Create content for the agent
        content = Content(role="user", parts=[Part(text=message)])
        
        async def generate():
            """Generate SSE stream from ADK events"""
            try:
                async for event in runner.run_async(
                    user_id=USER_ID,
                    session_id=session_id,
                    new_message=content
                ):
                    # Send different event types
                    if event.is_final_response():
                        # Final response from agent
                        if event.content and event.content.parts:
                            response_text = event.content.parts[0].text
                            yield f"data: {json.dumps({'type': 'text', 'content': response_text})}\n\n"
                        
                        # Check for escalation/error
                        if event.actions and event.actions.escalate:
                            error_msg = event.error_message or "Agent escalated"
                            yield f"data: {json.dumps({'type': 'error', 'content': error_msg})}\n\n"
                        
                        # Send done signal
                        yield f"data: {json.dumps({'type': 'done'})}\n\n"
                        break
                    
                    elif event.content and event.content.parts:
                        # Intermediate response (streaming)
                        text_chunk = event.content.parts[0].text
                        yield f"data: {json.dumps({'type': 'text', 'content': text_chunk})}\n\n"
                        
            except Exception as e:
                logger.error(f"Error in generate: {e}")
                yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
        
        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
        
    except Exception as e:
        logger.error(f"Error in chat_stream: {e}")
        return {"error": str(e)}


@app.post("/api/chat/simple")
async def chat_simple(request: Request):
    """Simple non-streaming chat endpoint for testing"""
    global runner, session_service
    
    try:
        body = await request.json()
        message = body.get("message", "")
        session_id = body.get("session_id", str(uuid.uuid4()))
        
        if not message:
            return {"error": "Message is required"}
        
        logger.info(f"Received simple message: {message}")
        
        # Create session if it doesn't exist
        try:
            await session_service.create_session(
                app_name=APP_NAME,
                user_id=USER_ID,
                session_id=session_id,
            )
        except Exception:
            pass
        
        # Create content for the agent
        content = Content(role="user", parts=[Part(text=message)])
        
        response_text = ""
        async for event in runner.run_async(
            user_id=USER_ID,
            session_id=session_id,
            new_message=content
        ):
            if event.is_final_response():
                if event.content and event.content.parts:
                    response_text = event.content.parts[0].text
                elif event.actions and event.actions.escalate:
                    response_text = f"Agent escalated: {event.error_message or 'No message'}"
                break
        
        return {"text": response_text, "session_id": session_id}
        
    except Exception as e:
        logger.error(f"Error in chat_simple: {e}")
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
