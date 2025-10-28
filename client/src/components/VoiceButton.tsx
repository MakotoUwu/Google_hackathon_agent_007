import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { AudioStreamer } from '../lib/audio-streamer';

interface VoiceButtonProps {
  onTranscript?: (text: string) => void;
  onPlacesFound?: (places: any[]) => void;
}

export function VoiceButton({ onTranscript, onPlacesFound }: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioWorkletRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const sessionIdRef = useRef<string>(`session_${Date.now()}`);

  useEffect(() => {
    // Initialize audio streamer
    audioStreamerRef.current = new AudioStreamer();

    return () => {
      // Cleanup
      stopRecording();
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (audioStreamerRef.current) {
        audioStreamerRef.current.close();
      }
    };
  }, []);

  const handleButtonClick = async () => {
    if (!isConnected) {
      // Connect on first click
      await connectWebSocket();
    } else if (isRecording) {
      // Stop recording
      stopRecording();
    } else {
      // Start recording
      await startRecording();
    }
  };

  const connectWebSocket = async () => {
    try {
      // Connect to voice WebSocket endpoint
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/voice`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'text':
              // Agent's text response
              setTranscript(data.text);
              if (onTranscript) {
                onTranscript(data.text);
              }
              break;

            case 'audio':
              // Agent's voice response
              setIsSpeaking(true);
              
              // Decode base64 to ArrayBuffer
              const audioData = Uint8Array.from(atob(data.data), c => c.charCodeAt(0));
              
              // Play audio
              await audioStreamerRef.current?.addChunk(audioData.buffer);
              
              setTimeout(() => setIsSpeaking(false), 1000);
              break;

            case 'tool_call':
              console.log('Agent is using tool:', data.tool);
              setTranscript(`Searching for places...`);
              break;

            case 'tool_response':
              console.log('Tool response received');
              break;

            case 'places':
              // Places found by agent
              if (onPlacesFound && data.places) {
                onPlacesFound(data.places);
              }
              break;

            case 'error':
              console.error('Agent error:', data.error);
              setError(data.error);
              break;
          }
        } catch (err) {
          console.error('Error processing message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Connection error');
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
      };
    } catch (err) {
      console.error('Error connecting WebSocket:', err);
      setError('Failed to connect');
    }
  };

  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      
      streamRef.current = stream;

      // Create audio context
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      // Load AudioWorklet processor
      await audioContext.audioWorklet.addModule('/audio-processor.js');

      // Create AudioWorklet node
      const audioWorklet = new AudioWorkletNode(audioContext, 'audio-processor');
      audioWorkletRef.current = audioWorklet;

      // Connect microphone to worklet
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(audioWorklet);

      // Handle audio chunks from worklet
      audioWorklet.port.onmessage = (event) => {
        if (event.data.type === 'audio' && wsRef.current?.readyState === WebSocket.OPEN) {
          // Convert to base64
          const uint8Array = new Uint8Array(event.data.data);
          const base64Audio = btoa(
            String.fromCharCode.apply(null, Array.from(uint8Array) as any)
          );

          // Send to server
          wsRef.current.send(JSON.stringify({
            type: 'audio',
            data: base64Audio,
            session_id: sessionIdRef.current,
          }));
        }
      };

      // Connect WebSocket if not connected
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        await connectWebSocket();
      }

      // Resume audio streamer
      await audioStreamerRef.current?.resume();

      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Microphone access denied');
    }
  };

  const stopRecording = () => {
    // Stop microphone
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    audioWorkletRef.current = null;
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleButtonClick}
        className={`
          relative p-4 rounded-full transition-all duration-200
          ${isRecording 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-blue-500 hover:bg-blue-600'
          }
          text-white shadow-lg hover:shadow-xl
        `}
        disabled={false}
      >
        {isRecording ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
        
        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
            <Volume2 className="w-4 h-4 text-white animate-pulse" />
          </div>
        )}
      </button>

      {/* Status text */}
      <div className="text-sm text-center">
        {error && <p className="text-red-500">{error}</p>}
        {!error && isRecording && <p className="text-blue-600">Listening...</p>}
        {!error && !isRecording && isConnected && <p className="text-gray-500">Click to speak</p>}
        {!error && !isRecording && !isConnected && <p className="text-gray-400">Connecting...</p>}
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="mt-2 p-3 bg-gray-100 rounded-lg max-w-md">
          <p className="text-sm text-gray-700">{transcript}</p>
        </div>
      )}
    </div>
  );
}
