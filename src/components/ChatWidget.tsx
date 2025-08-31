"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send, Plus } from "lucide-react";
export interface SuggestedActivity {
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  time?: string;
  notes?: string;
  tags?: string[];
}

interface ChatWidgetProps {
  destination?: string;
  selectedDateISO?: string | null;
  onAddActivity?: (a: SuggestedActivity) => void;
  currentDayActivities?: Array<{
    name: string;
    address?: string;
    time?: string;
    notes?: string;
    tags?: string[];
  }>;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget({ destination, selectedDateISO, onAddActivity, currentDayActivities }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedActivity[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

    const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    const userMessage: ChatMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Always use the chat API first, let the AI decide if activities should be generated
    try {
      // Build context with current day activities
      let enhancedContent = content;
      if (currentDayActivities && currentDayActivities.length > 0) {
        const activitiesList = currentDayActivities.map(a => 
          `- ${a.name}${a.time ? ` (${a.time})` : ''}${a.address ? ` at ${a.address}` : ''}`
        ).join('\n');
        enhancedContent = `${content}\n\nCurrent day activities:\n${activitiesList}`;
      }

      console.log('Calling /api/chat with:', { 
        messages: [...messages, { role: 'user', content: enhancedContent }].map(m => ({ role: m.role, content: m.content }))
      });
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, { role: 'user', content: enhancedContent }].map(m => ({ role: m.role, content: m.content }))
        }),
      });
      
      console.log('Chat response status:', response.status);

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let assistantMessage = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        console.log('Raw chunk:', chunk);
        
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(data);
              console.log('Parsed chunk:', parsed);
              if (parsed.type === 'text-delta' && parsed.text) {
                assistantMessage += parsed.text;
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = assistantMessage;
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              console.log('Failed to parse line:', line, e);
              // Try to handle plain text responses
              if (data && data !== '[DONE]') {
                assistantMessage += data;
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = assistantMessage;
                  }
                  return newMessages;
                });
              }
            }
          } else if (line.trim() && !line.startsWith('data: ')) {
            // Handle plain text responses
            console.log('Plain text line:', line);
            assistantMessage += line;
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                lastMessage.content = assistantMessage;
              }
              return newMessages;
            });
          }
        }
      }

             console.log('Full AI response:', assistantMessage);
       
       // Check if the response is pure JSON (activities) or conversational text
       const trimmedResponse = assistantMessage.trim();
       
       // Try to parse as JSON first (for activity responses)
       try {
         // Handle JSON wrapped in markdown code blocks
         let jsonString = trimmedResponse;
         if (trimmedResponse.startsWith('```json') && trimmedResponse.endsWith('```')) {
           jsonString = trimmedResponse.slice(7, -3).trim(); // Remove ```json and ```
         } else if (trimmedResponse.startsWith('```') && trimmedResponse.endsWith('```')) {
           jsonString = trimmedResponse.slice(3, -3).trim(); // Remove ``` and ```
         }
         
         const activities = JSON.parse(jsonString);
         if (Array.isArray(activities)) {
           console.log('Parsed activities from JSON response:', activities);
           setSuggestions(activities);
           
           // Replace the JSON response with a friendly message
           setMessages(prev => {
             const newMessages = [...prev];
             const lastMessage = newMessages[newMessages.length - 1];
             if (lastMessage && lastMessage.role === 'assistant') {
               lastMessage.content = `✨ I've found ${activities.length} great activities for you! Check out the suggestions below.`;
             }
             return newMessages;
           });
         }
       } catch (jsonError) {
         // Not JSON, so it's a conversational response - display it normally
         console.log('Response is conversational, not JSON');
       }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }
    
    setIsLoading(false);
  };

  const fetchSuggestions = async () => {
    try {
      const resp = await fetch("/api/activities/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, date: selectedDateISO }),
      });
      if (!resp.ok) return;
      const data = await resp.json();
      setSuggestions(data.activities || []);
    } catch {}
  };

  const handleAdd = (s: SuggestedActivity) => {
    onAddActivity?.(s);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 rounded-full bg-white text-gray-900 px-4 py-2 font-medium shadow-lg border border-white/20"
      >
        AI Chat
      </button>

      {open && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0" />
          <div className="pointer-events-auto absolute bottom-5 right-5 w-[92vw] max-w-md rounded-2xl border border-white/20 bg-black/70 backdrop-blur text-white shadow-xl">
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <div className="font-semibold">Trip AI</div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={listRef} className="max-h-72 overflow-y-auto p-3 space-y-2">
              {messages.map((m, i) => (
                <div key={i} className={`text-sm ${m.role === "user" ? "text-right" : "text-left"}`}>
                  <div className={`inline-block px-3 py-2 rounded-lg border ${m.role === "user" ? "bg-white text-gray-900 border-white" : "bg-white/10 border-white/20"}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && <div className="text-xs text-white/60">Thinking…</div>}
            </div>

            {/* Composer */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for activities, tips…"
                  className="flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 outline-none"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="rounded-lg bg-white text-gray-900 px-3 py-2 font-medium disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-white/60">
                <div>
                  {destination ? `Destination: ${destination}` : ""}
                  {selectedDateISO ? `  ·  ${selectedDateISO}` : ""}
                </div>
                <button type="button" onClick={fetchSuggestions} className="underline hover:text-white">Suggest activities</button>
              </div>
            </form>

                         {/* Suggestions */}
             {suggestions.length > 0 && (
               <div className="border-t border-white/10">
                 <div className="p-3 border-b border-white/10">
                   <div className="text-sm font-medium text-white/80">Suggested Activities</div>
                 </div>
                 <div className="max-h-64 overflow-y-auto p-3 space-y-2">
                   {suggestions.map((s, idx) => (
                     <div key={idx} className="rounded-lg border border-white/20 bg-white/5 p-3">
                       <div className="text-sm font-medium">{s.name}</div>
                       {s.address && <div className="text-xs text-white/70 mt-1">{s.address}</div>}
                       {s.notes && (
                         <div className="text-xs text-white/80 mt-2 p-2 bg-white/5 rounded border-l-2 border-white/20">
                           {s.notes}
                         </div>
                       )}
                       <div className="mt-2 flex items-center justify-between">
                         <div className="text-xs text-white/60">{s.time || ""}</div>
                         <button onClick={() => handleAdd(s)} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs border border-white/20">
                           <Plus className="w-3 h-3" /> Add to day
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </div>
        </div>
      )}
    </>
  );
}


