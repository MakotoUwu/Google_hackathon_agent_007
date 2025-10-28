/**
 * WebSocket proxy for voice streaming
 * Forwards audio streams between client and Python FastAPI voice server
 */

import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

export function setupVoiceProxy(server: Server) {
  // Create WebSocket server for voice
  const wss = new WebSocketServer({ 
    server,
    path: '/api/voice'
  });

  console.log('[Voice] WebSocket proxy initialized on /api/voice');

  wss.on('connection', (clientWs: WebSocket) => {
    console.log('[Voice] Client connected');

    // Connect to Python FastAPI voice server
    const pythonWs = new WebSocket('ws://localhost:8001/ws/voice');
    
    let isConnected = false;

    pythonWs.on('open', () => {
      console.log('[Voice] Connected to Python voice server');
      isConnected = true;
      
      // Send connection confirmation to client
      clientWs.send(JSON.stringify({
        type: 'connected',
        message: 'Voice server ready'
      }));
    });

    pythonWs.on('error', (error: Error) => {
      console.error('[Voice] Python server error:', error);
      
      clientWs.send(JSON.stringify({
        type: 'error',
        error: 'Voice server unavailable. Please start Python voice server on port 8001.'
      }));
    });

    pythonWs.on('close', () => {
      console.log('[Voice] Python server disconnected');
      isConnected = false;
      
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.close();
      }
    });

    // Forward messages from client to Python server
    clientWs.on('message', (data: Buffer) => {
      if (isConnected && pythonWs.readyState === WebSocket.OPEN) {
        pythonWs.send(data);
      } else {
        console.warn('[Voice] Cannot forward message - Python server not connected');
      }
    });

    // Forward messages from Python server to client
    pythonWs.on('message', (data: Buffer) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(data);
      }
    });

    // Handle client disconnect
    clientWs.on('close', () => {
      console.log('[Voice] Client disconnected');
      
      if (pythonWs.readyState === WebSocket.OPEN) {
        // Send close message to Python server
        pythonWs.send(JSON.stringify({ type: 'close' }));
        pythonWs.close();
      }
    });

    clientWs.on('error', (error: Error) => {
      console.error('[Voice] Client error:', error);
    });
  });

  return wss;
}
