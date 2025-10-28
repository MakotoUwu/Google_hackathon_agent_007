"""
Python runner for the accessibility agent that can be called from Node.js
Includes Memory Service for conversation context
"""
import asyncio
import json
import sys
from typing import AsyncIterator

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.memory import InMemoryMemoryService
from google.genai import types
from agent import root_agent

# Global services to persist across calls
_session_service = None
_memory_service = None


def get_services():
    """Get or create singleton services"""
    global _session_service, _memory_service
    
    if _session_service is None:
        _session_service = InMemorySessionService()
    
    if _memory_service is None:
        _memory_service = InMemoryMemoryService()
    
    return _session_service, _memory_service


async def run_agent_stream(query: str, session_id: str = "default", user_id: str = "default") -> AsyncIterator[str]:
    """
    Run the agent with streaming responses.
    Yields JSON objects with type and content.
    """
    try:
        # Get shared services
        session_service, memory_service = get_services()
        
        # Create session if it doesn't exist
        session = await session_service.get_session(
            app_name="maps_agent",
            user_id=user_id,
            session_id=session_id
        )
        
        if session is None:
            await session_service.create_session(
                app_name="maps_agent",
                user_id=user_id,
                session_id=session_id
            )
        
        # Create runner with memory service
        runner = Runner(
            app_name="maps_agent",
            agent=root_agent,
            session_service=session_service,
            memory_service=memory_service
        )
        
        # Create message content
        new_message = types.Content(
            role="user",
            parts=[types.Part(text=query)]
        )
        
        # Run agent with streaming
        async for event in runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=new_message
        ):
            # Convert event to JSON and yield
            event_type = type(event).__name__
            
            # Extract content based on event type
            if hasattr(event, "content"):
                content = event.content
            elif hasattr(event, "text"):
                content = event.text
            else:
                content = str(event)
            
            event_data = {
                "type": event_type,
                "content": content
            }
            yield json.dumps(event_data) + "\n"
            
    except Exception as e:
        import traceback
        error_data = {
            "type": "error",
            "content": str(e),
            "traceback": traceback.format_exc()
        }
        yield json.dumps(error_data) + "\n"


async def run_agent(query: str, session_id: str = "default", user_id: str = "default") -> dict:
    """
    Run the agent and return the final response.
    Automatically saves completed sessions to memory.
    """
    try:
        # Get shared services
        session_service, memory_service = get_services()
        
        # Create session if it doesn't exist
        session = await session_service.get_session(
            app_name="maps_agent",
            user_id=user_id,
            session_id=session_id
        )
        
        if session is None:
            await session_service.create_session(
                app_name="maps_agent",
                user_id=user_id,
                session_id=session_id
            )
        
        # Create runner with memory service
        runner = Runner(
            app_name="maps_agent",
            agent=root_agent,
            session_service=session_service,
            memory_service=memory_service
        )
        
        # Create message content
        new_message = types.Content(
            role="user",
            parts=[types.Part(text=query)]
        )
        
        # Collect all events
        events = []
        final_response = None
        
        async for event in runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=new_message
        ):
            events.append(event)
            event_type = type(event).__name__
            
            # Try to extract response from any event with content
            if hasattr(event, "content") and event.content is not None:
                # Only process model responses (not user messages)
                if hasattr(event.content, "role") and event.content.role == "model":
                    # Extract text from Content
                    if hasattr(event.content, "parts"):
                        text_parts = []
                        for part in event.content.parts:
                            if hasattr(part, "text") and part.text:
                                text_parts.append(part.text)
                        if text_parts:
                            final_response = "\n".join(text_parts)
        
        # After conversation, add session to memory for future recall
        try:
            completed_session = await session_service.get_session(
                app_name="maps_agent",
                user_id=user_id,
                session_id=session_id
            )
            if completed_session:
                await memory_service.add_session_to_memory(completed_session)
        except Exception as mem_error:
            # Don't fail the whole request if memory save fails
            print(f"Warning: Failed to save session to memory: {mem_error}", file=sys.stderr)
        
        return {
            "success": True,
            "response": final_response if final_response else "No response generated",
            "session_id": session_id,
            "user_id": user_id
        }
        
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc(),
            "session_id": session_id,
            "user_id": user_id
        }


if __name__ == "__main__":
    # CLI interface for testing
    if len(sys.argv) < 2:
        print("Usage: python runner.py <query> [session_id] [user_id]")
        sys.exit(1)
    
    query = sys.argv[1]
    session_id = sys.argv[2] if len(sys.argv) > 2 else "default"
    user_id = sys.argv[3] if len(sys.argv) > 3 else "default"
    
    # Run agent
    result = asyncio.run(run_agent(query, session_id, user_id))
    print(json.dumps(result, indent=2))
