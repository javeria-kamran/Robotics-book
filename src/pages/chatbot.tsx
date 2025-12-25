import { useState, useRef, useEffect, type ReactNode, type FormEvent, type KeyboardEvent } from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import ReactMarkdown from 'react-markdown';
import { useAuth, API_URL } from '../context/AuthContext';
import styles from './chatbot.module.css';

// Constants for message limits
const ANONYMOUS_MESSAGE_LIMIT = 3;
const AUTHENTICATED_MESSAGE_LIMIT = 20;
const ANONYMOUS_STORAGE_KEY = 'anonymous_chat_messages';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  timestamp: Date;
  sources?: Array<{ title: string; file: string; score: number }>;
}

function ThinkingIndicator() {
  return (
    <div className={styles.thinking}>
      <span className={styles.thinkingDot} />
      <span className={styles.thinkingDot} />
      <span className={styles.thinkingDot} />
    </div>
  );
}

function MessageBubble({ message, onRetry }: { message: Message; onRetry?: () => void }) {
  const isUser = message.role === 'user';
  const isError = message.role === 'error';
  
  return (
    <div className={`${styles.message} ${isUser ? styles.userMessage : isError ? styles.errorMessage : styles.assistantMessage}`}>
      <div className={styles.messageHeader}>
        <span className={styles.messageRole}>
          {isUser ? 'YOU' : isError ? 'ERROR' : 'AI'}
        </span>
        <span className={styles.messageTime}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className={styles.messageContent}>
        {isUser ? (
          message.content
        ) : isError ? (
          <>
            <p>{message.content}</p>
            {onRetry && (
              <button onClick={onRetry} className={styles.retryBtn}>
                Try Again
              </button>
            )}
          </>
        ) : (
          <ReactMarkdown>{message.content}</ReactMarkdown>
        )}
      </div>
      {message.sources && message.sources.length > 0 && (
        <div className={styles.sources}>
          <span className={styles.sourcesLabel}>Sources:</span>
          {message.sources.map((source, idx) => (
            <span key={idx} className={styles.sourceTag}>
              {source.title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function StreamingMessage({ content }: { content: string }) {
  return (
    <div className={`${styles.message} ${styles.assistantMessage}`}>
      <div className={styles.messageHeader}>
        <span className={styles.messageRole}>ROBO-SAGE</span>
        <span className={styles.streamingBadge}>typing...</span>
      </div>
      <div className={styles.messageContent}>
        <ReactMarkdown>{content || '...'}</ReactMarkdown>
        <span className={styles.cursor} />
      </div>
    </div>
  );
}

function EmptyState({ onSuggestionClick }: { onSuggestionClick: (s: string) => void }) {
  const suggestions = [
    'What is ROS 2 and why do I need it?',
    'Explain URDF for humanoid robots',
    'Gazebo vs Isaac Sim comparison',
    'What are Vision-Language-Action models?',
  ];

  return (
    <div className={styles.emptyState}>
      <img src="/img/chat-icon.svg" alt="Chat" className={styles.logo} />
      <h1 className={styles.emptyTitle}>AI Assistant</h1>
      <p className={styles.emptySubtitle}>
        Your AI assistant for Physical AI & Humanoid Robotics.
      </p>
      <p className={styles.emptyHint}>I've read the book so you don't have to.</p>
      <div className={styles.suggestions}>
        <span className={styles.suggestionsLabel}>Quick questions</span>
        <div className={styles.suggestionGrid}>
          {suggestions.map((suggestion, idx) => (
            <button 
              key={idx} 
              className={styles.suggestionBtn} 
              type="button"
              onClick={() => onSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ApiStatus({ status }: { status: 'checking' | 'online' | 'offline' }) {
  if (status === 'checking') return null;
  
  return (
    <div className={`${styles.apiStatus} ${status === 'online' ? styles.apiOnline : styles.apiOffline}`}>
      <span className={styles.statusDot} />
      {status === 'online' ? 'Connected' : 'Offline'}
    </div>
  );
}

export default function ChatbotPage(): ReactNode {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [lastQuery, setLastQuery] = useState('');
  const [messagesUsed, setMessagesUsed] = useState(0);
  const [messageLimit, setMessageLimit] = useState(ANONYMOUS_MESSAGE_LIMIT);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load message usage on mount
  useEffect(() => {
    if (user && token) {
      // Authenticated user - fetch from API
      setMessageLimit(AUTHENTICATED_MESSAGE_LIMIT);
      fetch(`${API_URL}/chat/limit`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setMessagesUsed(data.used || 0))
        .catch(() => {});
    } else {
      // Anonymous user - check localStorage
      setMessageLimit(ANONYMOUS_MESSAGE_LIMIT);
      const stored = localStorage.getItem(ANONYMOUS_STORAGE_KEY);
      if (stored) {
        const { count, date } = JSON.parse(stored);
        // Reset if it's a new day
        const today = new Date().toDateString();
        if (date === today) {
          setMessagesUsed(count);
        } else {
          localStorage.setItem(ANONYMOUS_STORAGE_KEY, JSON.stringify({ count: 0, date: today }));
          setMessagesUsed(0);
        }
      }
    }
  }, [user, token]);

  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await fetch(`${API_URL}/health`);
        if (res.ok) {
          const data = await res.json();
          setApiStatus(data.qdrant && data.gemini ? 'online' : 'offline');
        } else {
          setApiStatus('offline');
        }
      } catch {
        setApiStatus('offline');
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 30000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const lastScrollRef = useRef(0);
  useEffect(() => {
    if (isStreaming && streamContent.length - lastScrollRef.current > 150) {
      lastScrollRef.current = streamContent.length;
      scrollToBottom(false);
    }
  }, [streamContent, isStreaming]);

  const streamFromAPI = async (query: string): Promise<{ content: string; sources: Message['sources']; error?: string }> => {
    if (apiStatus === 'offline') {
      return { 
        content: '', 
        sources: [], 
        error: "Backend is sleeping. Run `python scripts/api.py` to wake it up." 
      };
    }

    try {
      const response = await fetch(`${API_URL}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, top_k: 5 }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      setIsStreaming(true);
      setStreamContent('');
      lastScrollRef.current = 0;

      let fullContent = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullContent += decoder.decode(value, { stream: true });
        setStreamContent(fullContent);
      }

      setIsStreaming(false);
      
      let sources: Message['sources'] = [];
      try {
        const sourcesRes = await fetch(`${API_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: query, top_k: 3 }),
        });
        if (sourcesRes.ok) {
          sources = (await sourcesRes.json()).sources;
        }
      } catch { /* sources optional */ }

      return { content: fullContent, sources };
    } catch (err) {
      setIsStreaming(false);
      return { 
        content: '', 
        sources: [], 
        error: `Shit broke: ${err instanceof Error ? err.message : 'Unknown error'}` 
      };
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading || isStreaming) return;
    
    // Check message limit
    if (messagesUsed >= messageLimit) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'error',
        content: user 
          ? `You've reached your daily limit of ${messageLimit} messages. Come back tomorrow!`
          : `You've used your ${ANONYMOUS_MESSAGE_LIMIT} free messages. Sign in for ${AUTHENTICATED_MESSAGE_LIMIT} messages per day!`,
        timestamp: new Date(),
      }]);
      return;
    }
    
    setLastQuery(text);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const { content, sources, error } = await streamFromAPI(text);
    setIsLoading(false);

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: error ? 'error' : 'assistant',
      content: error || content,
      timestamp: new Date(),
      sources: error ? undefined : sources,
    }]);
    
    // Increment message count
    if (!error) {
      const newCount = messagesUsed + 1;
      setMessagesUsed(newCount);
      
      if (user && token) {
        // Increment on server
        fetch(`${API_URL}/chat/increment`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => {});
      } else {
        // Store in localStorage
        localStorage.setItem(ANONYMOUS_STORAGE_KEY, JSON.stringify({
          count: newCount,
          date: new Date().toDateString()
        }));
      }
    }
    
    setStreamContent('');
  };

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    sendMessage(input);
  };

  const handleRetry = () => {
    if (lastQuery) {
      setMessages(prev => prev.slice(0, -1));
      sendMessage(lastQuery);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      <Head>
        <title>AI Assistant | Physical AI</title>
        <meta name="description" content="AI assistant for Physical AI & Humanoid Robotics" />
      </Head>
      <div className={styles.page}>
        <header className={styles.header}>
          <a href="/" className={styles.backLink}>
            ← Back to Book
          </a>
          <h1 className={styles.headerTitle}>AI Assistant</h1>
          <div className={styles.headerActions}>
            <div className={styles.messageCounter}>
              {messagesUsed}/{messageLimit} messages
              {!user && messagesUsed >= messageLimit && (
                <Link to="/signin" className={styles.signInLink}>Sign in for more</Link>
              )}
            </div>
            <ApiStatus status={apiStatus} />
            {messages.length > 0 && (
              <button onClick={() => setMessages([])} className={styles.clearBtn}>Clear</button>
            )}
          </div>
        </header>

        <main className={styles.chatContainer}>
          <div className={styles.messagesContainer}>
            {messages.length === 0 && !isLoading && !isStreaming ? (
              <EmptyState onSuggestionClick={sendMessage} />
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <MessageBubble 
                    key={msg.id} 
                    message={msg} 
                    onRetry={msg.role === 'error' && idx === messages.length - 1 ? handleRetry : undefined}
                  />
                ))}
                {isLoading && !isStreaming && (
                  <div className={`${styles.message} ${styles.assistantMessage}`}>
                    <div className={styles.messageHeader}>
                      <span className={styles.messageRole}>AI</span>
                      <span className={styles.thinkingBadge}>thinking...</span>
                    </div>
                    <ThinkingIndicator />
                  </div>
                )}
                {isStreaming && <StreamingMessage content={streamContent} />}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <form className={styles.inputForm} onSubmit={handleSubmit}>
            <div className={styles.inputWrapper}>
              <textarea
                ref={inputRef}
                className={styles.input}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={apiStatus === 'offline' ? "Start the API first..." : "Ask me anything about robotics..."}
                rows={1}
                disabled={isLoading || isStreaming || apiStatus === 'offline'}
              />
              <button
                type="submit"
                className={styles.sendBtn}
                disabled={!input.trim() || isLoading || isStreaming || apiStatus === 'offline'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" />
                </svg>
              </button>
            </div>
            <p className={styles.disclaimer}>
              Powered by RAG + Gemini. I try my best, but I'm an AI—occasional bullshit guaranteed.
            </p>
          </form>
        </main>
      </div>
    </>
  );
}
