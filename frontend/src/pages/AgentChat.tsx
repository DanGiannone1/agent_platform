// frontend/src/pages/AgentChat.tsx

import { useState, useRef, FormEvent } from 'react';
import { ArrowRight, User, Bot, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Extended message type including eventType and active flag.
interface Message {
  role: 'human' | 'ai' | 'system';
  content: string;
  eventType?: string;
  active?: boolean;
}

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
}

/**
 * Return [hue, saturation, lightness] for a given string, to ensure
 * consistent coloring. We'll apply alpha later for inactive messages.
 */
function getColorHSLFromString(str: string): [number, number, number] {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  // Just pick some default saturation/lightness to your liking.
  const saturation = 70;
  const lightness = 50;
  return [hue, saturation, lightness];
}

/**
 * Returns the CSS classes for a message bubble.
 * For human messages, it's fixed.
 * For AI messages:
 *  - chunk_stream events have minimal text styling (no bubble).
 *  - custom events use bubble styling with dynamic color. 
 */
const getBubbleClasses = (message: Message) => {
  if (message.role === 'system') {
    return "py-1.5 text-neutral-500 text-[13px] max-w-[65%]";
  } else if (message.role === 'human') {
    return "bg-neutral-800 py-2 px-4 rounded-full max-w-[40%]";
  } else {
    if (message.eventType === 'chunk_stream' || message.eventType === 'greeting') {
      return "max-w-[65%] text-neutral-200 py-4 px-6";
    } else if (message.eventType) {
      return message.active
        ? "py-2 px-4 rounded-lg max-w-[45%] shadow-sm animate-pulse"
        : "py-2 px-4 rounded-lg max-w-[45%] shadow-sm opacity-60 transition-opacity duration-500";
    } else {
      return "bg-gray-600 p-5 rounded-2xl max-w-[65%] shadow-lg";
    }
  }
};

/**
 * Returns the style object for a message bubble, applying:
 *  - No special color for human or chunk_stream events.
 *  - A color for custom AI events:
 *    * Full opacity HSL for active.
 *    * Partial alpha for inactive/faded look.
 */
const getBubbleStyle = (message: Message) => {
  if (
    message.role === 'ai' &&
    message.eventType &&
    message.eventType !== 'chunk_stream' &&
    message.eventType !== 'greeting'
  ) {
    const [hue, sat, light] = getColorHSLFromString(message.eventType);
    if (message.active) {
      // Full color
      return { backgroundColor: `hsl(${hue}, ${sat}%, ${light}%)` };
    } else {
      // Same hue but partially transparent, so it fades out
      return { backgroundColor: `hsla(${hue}, ${sat}%, ${light}%, 0.3)` };
    }
  }
  return {};
};

const getBotIconClasses = (message: Message) => {
  const baseClasses = "w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center ring-1 shadow-lg transition-all duration-500";
  
  // For greeting agent, use blue theme
  if (message.eventType === 'greeting') {
    return `${baseClasses} from-blue-500/30 to-blue-600/30 ring-blue-500/40 shadow-blue-500/20 ${message.active ? 'animate-subtle-bounce' : ''}`;
  }

  // For Data Intelligence Agent (all other events), use green theme
  if (message.active) {
    return `${baseClasses} from-emerald-500/30 to-emerald-600/30 ring-emerald-500/40 shadow-emerald-500/20 animate-subtle-bounce shadow-lg`;
  }

  // Inactive state for Data Intelligence Agent
  return `${baseClasses} from-emerald-500/20 to-emerald-600/20 ring-emerald-500/30 shadow-emerald-500/10`;
};

const getBotIconStyle = (message: Message) => {
  if (!message.active) {
    return { opacity: 0.6 };
  }
  return {};
};

// Helper to get the icon color based on message type
const getBotIconColor = (message: Message) => {
  if (message.eventType === 'greeting') {
    return message.active ? 'text-blue-400' : 'text-blue-400/60';
  }
  
  // Data Intelligence Agent (all other events) uses green
  return message.active ? 'text-emerald-400' : 'text-emerald-400/60';
};

const AgentChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: 'Hello! Let me know what you need and I will connect you with the right agent.',
      eventType: 'greeting',
      active: true // Start as active
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Utility: Mark any active custom (non-chunk_stream) AI bubble as inactive.
  const markActiveCustomMessagesInactive = () => {
    setMessages((prev) => {
      // Find the last AI message that should stay active
      const lastActiveIndex = [...prev].reverse().findIndex(m => 
        m.role === 'ai' && 
        m.active && 
        (!m.eventType || m.eventType === 'chunk_stream' || m.eventType === 'greeting')
      );

      if (lastActiveIndex === -1) {
        // No message to keep active, mark all as inactive
        return prev.map(m => m.active ? { ...m, active: false } : m);
      }

      // Keep the last AI message active, mark others as inactive
      return prev.map((m, i) => {
        if (i === prev.length - 1 - lastActiveIndex) {
          // This is the last AI message, keep it active
          return m;
        }
        return m.active ? { ...m, active: false } : m;
      });
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Generate a unique taskId for this run.
    const taskId = crypto.randomUUID();

    // Add the user's message immediately and mark all AI messages as inactive
    const userMessage: Message = { role: 'human', content: input };
    const systemMessage: Message = { 
      role: 'system', 
      content: 'Data Intelligence Agent has entered the chat' 
    };
    setMessages((prev) => [
      ...prev.map(m => m.role === 'ai' ? { ...m, active: false } : m),
      userMessage,
      systemMessage
    ]);
    setInput('');
    setIsLoading(true);

    try {
      // POST the taskId and user message to the run_agent endpoint.
      const response = await fetch(
        `${import.meta.env.VITE_DATA_INTELLIGENCE_AGENT_ENDPOINT}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId, message: input }),
        }
      );

      if (!response.ok)
        throw new Error(`Failed to run agent: ${response.status}`);

      const result = await response.json();
      console.log('Agent accepted task:', result);

      // Open an SSE connection to the /stream/{task_id} endpoint.
      const streamUrl = `${import.meta.env.VITE_AGENT_GATEWAY_ENDPOINT}/stream/${taskId}`;
      const eventSource = new EventSource(streamUrl);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const eventType: string = data.eventType;
          console.log("Received event:", eventType, data);

          // Handle custom events (retrieve, review, etc.).
          if (eventType === 'retrieve' || eventType === 'review') {
            markActiveCustomMessagesInactive();
            const newMsg: Message = {
              role: 'ai',
              content: data.payload?.message || '',
              eventType,
              active: true,
            };
            setMessages((prev) => [...prev, newMsg]);
          }
          // Handle streaming chunks.
          else if (eventType === 'chunk_stream') {
            markActiveCustomMessagesInactive();
            setMessages((prev) => {
              if (
                prev.length > 0 &&
                prev[prev.length - 1].eventType === 'chunk_stream' &&
                prev[prev.length - 1].active
              ) {
                const updatedMsg = {
                  ...prev[prev.length - 1],
                  content:
                    prev[prev.length - 1].content + (data.payload?.message || ''),
                };
                return [...prev.slice(0, prev.length - 1), updatedMsg];
              } else {
                const newMsg: Message = {
                  role: 'ai',
                  content: data.payload?.message || '',
                  eventType: 'chunk_stream',
                  active: true,
                };
                return [...prev, newMsg];
              }
            });
          }
          // Handle final payload event.
          else if (eventType === 'final_payload') {
            console.log('Final event received. Closing stream.');
            eventSource.close();
            eventSourceRef.current = null;
          } else {
            console.log('Ignored event type:', eventType);
          }
        } catch (parseError) {
          console.error('Error parsing event data:', parseError);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        eventSourceRef.current = null;
      };
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'ai',
        content: `Error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`group flex items-start gap-4 mb-8 animate-fade-in ${
                message.role === 'human' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'ai' && (
                <div className="flex-none pt-1">
                  <div 
                    className={getBotIconClasses(message)}
                    style={getBotIconStyle(message)}
                  >
                    <Bot size={20} className={`${getBotIconColor(message)} transition-colors duration-500`} />
                  </div>
                </div>
              )}
              {message.role === 'system' && (
                <div className="flex-none pt-1">
                  <div className="w-6 h-6 rounded-full bg-neutral-800/50 flex items-center justify-center">
                    <Bot size={14} className="text-neutral-500" />
                  </div>
                </div>
              )}
              <div
                className={getBubbleClasses(message)}
                style={message.role !== 'system' ? getBubbleStyle(message) : {}}
              >
                {message.role === 'system' ? (
                  <span className="inline-flex items-center">
                    {message.content}
                  </span>
                ) : message.role === 'human' ? (
                  <p className="text-neutral-200">{message.content}</p>
                ) : message.eventType && message.eventType !== 'chunk_stream' ? (
                  // Special styling for custom event messages
                  <p className="text-[14px] leading-relaxed text-neutral-200 font-medium">
                    {message.content}
                  </p>
                ) : (
                  <div className="prose prose-invert max-w-none prose-lg">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ node, ...props }) => (
                          <h1
                            className="text-3xl font-bold text-white mb-6"
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2
                            className="text-2xl font-semibold text-white mb-5"
                            {...props}
                          />
                        ),
                        p: ({ node, ...props }) => (
                          <p
                            className="text-[17px] leading-[1.7] text-neutral-100 mb-5 last:mb-0"
                            {...props}
                          />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong
                            className="font-semibold text-white"
                            {...props}
                          />
                        ),
                        em: ({ node, ...props }) => (
                          <em
                            className="text-neutral-200 font-medium not-italic"
                            {...props}
                          />
                        ),
                        code: ({ inline, ...props }: CodeProps) =>
                          inline ? (
                            <code
                              className="bg-neutral-800 px-2 py-0.5 rounded-md text-[14px] font-medium text-neutral-200"
                              {...props}
                            />
                          ) : (
                            <code
                              className="block bg-neutral-800 p-5 rounded-lg text-[15px] text-neutral-200 my-4"
                              {...props}
                            />
                          ),
                        ul: ({ node, ...props }) => (
                          <ul className="list-none space-y-4 my-5" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="flex items-start gap-3" {...props}>
                            <span className="text-neutral-400 mt-1.5 text-lg">•</span>
                            <span className="flex-1 text-[17px] leading-[1.7] text-neutral-100">{props.children}</span>
                          </li>
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote
                            className="border-l-4 border-neutral-700 pl-6 py-1 my-5 italic text-neutral-200 text-[17px]"
                            {...props}
                          />
                        ),
                        a: ({ node, ...props }) => (
                          <a
                            className="text-blue-400 hover:text-blue-300 underline font-medium"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              {message.role === 'human' && (
                <div className="flex-none pt-1">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                    <User size={18} className="text-neutral-400" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex-none p-4 bg-[#1a1a1a] border-t border-neutral-800">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-[#1e1e1e] border border-neutral-800 rounded-full px-4 py-2.5 text-neutral-200 focus:outline-none focus:border-blue-500/30 focus:bg-[#1e1e1e]/50 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-3 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowRight size={20} />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentChat;
