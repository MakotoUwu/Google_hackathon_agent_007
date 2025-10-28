import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Loader2 } from 'lucide-react';
import { Streamdown } from 'streamdown';
import { trpc } from '@/lib/trpc';
import { parsePlacesFromResponse, type ParsedPlace } from '@/lib/parse-places';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  places?: ParsedPlace[];
}

interface ChatInterfaceProps {
  onPlacesFound?: (places: ParsedPlace[]) => void;
}

export default function ChatInterface({ onPlacesFound }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef(`session_${Date.now()}`);

  // tRPC mutation for agent query
  const agentQuery = trpc.agent.query.useMutation({
    onSuccess: (data) => {
      // Parse places from response
      const places = parsePlacesFromResponse(data.response);
      
      // Add assistant response to messages
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        places: places.length > 0 ? places : undefined,
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Notify parent about found places
      if (places.length > 0 && onPlacesFound) {
        onPlacesFound(places);
      }
    },
    onError: (error) => {
      console.error('Agent query error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Sorry, there was an error: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || agentQuery.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const queryText = input;
    setInput('');

    // Call agent via tRPC
    agentQuery.mutate({
      query: queryText,
      sessionId: sessionIdRef.current,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground mt-8">
            <p className="text-lg font-medium mb-2">♿ Welcome to Accessible Journey Assistant!</p>
            <p className="text-sm mb-4">Your AI companion for finding wheelchair-accessible places with verified accessibility features. Powered by Google ADK and real-time location data.</p>
            <div className="text-xs text-muted-foreground/70 space-y-1">
              <p className="font-semibold">Try these examples:</p>
              <p>• "Find wheelchair accessible cafes in San Francisco"</p>
              <p>• "Show me accessible restaurants near Golden Gate Park"</p>
              <p>• "Where can I find accessible museums in downtown?"</p>
            </div>
          </div>
        )}

        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex flex-col max-w-[80%]">
              <Card
                className={`p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.role === 'assistant' ? (
                  <Streamdown>{message.content}</Streamdown>
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </Card>
              
              {/* Show places count if found */}
              {message.places && message.places.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1 px-1">
                  Found {message.places.length} accessible place{message.places.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        ))}

        {agentQuery.isPending && (
          <div className="flex justify-start">
            <Card className="max-w-[80%] p-3 bg-muted">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Searching for accessible places...</span>
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about wheelchair-accessible places..."
            disabled={agentQuery.isPending}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={agentQuery.isPending || !input.trim()}>
            {agentQuery.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
