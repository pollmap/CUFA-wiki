import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  apiEndpoint?: string;
  systemPrompt?: string;
  placeholder?: string;
  title?: string;
}

const defaultSystemPrompt = `당신은 밸류에이션 전문 AI 튜터입니다.
DCF, 상대가치평가, 기술적 분석 등 투자와 가치평가에 관한 질문에 친절하고 상세하게 답변해주세요.
한국어로 답변하며, 필요시 공식이나 예시를 포함해주세요.
투자자산운용사, CFA 등 자격증 관련 질문에도 도움을 줄 수 있습니다.`;

export default function ChatWidget({
  apiEndpoint = '/api/chat',
  systemPrompt = defaultSystemPrompt,
  placeholder = '밸류에이션에 관해 질문하세요...',
  title = 'AI 튜터',
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          systemPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error('API 요청 실패');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.content || data.message || '응답을 받지 못했습니다.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: '죄송합니다. 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const toggleButtonStyle: React.CSSProperties = {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(26, 54, 93, 0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  };

  const chatWindowStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '70px',
    right: '0',
    width: '380px',
    height: '500px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
    color: 'white',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const messagesContainerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    backgroundColor: '#f7fafc',
  };

  const messageStyle = (isUser: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '16px',
    flexDirection: isUser ? 'row-reverse' : 'row',
  });

  const avatarStyle = (isUser: boolean): React.CSSProperties => ({
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: isUser ? '#48bb78' : '#1a365d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  });

  const bubbleStyle = (isUser: boolean): React.CSSProperties => ({
    maxWidth: '75%',
    padding: '12px 16px',
    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
    backgroundColor: isUser ? '#1a365d' : '#ffffff',
    color: isUser ? '#ffffff' : '#2d3748',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  });

  const inputContainerStyle: React.CSSProperties = {
    padding: '16px',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-end',
  };

  const textareaStyle: React.CSSProperties = {
    flex: 1,
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    resize: 'none',
    fontFamily: 'inherit',
    fontSize: '14px',
    lineHeight: '1.4',
    minHeight: '44px',
    maxHeight: '120px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const sendButtonStyle: React.CSSProperties = {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: isLoading || !input.trim() ? '#cbd5e0' : '#1a365d',
    border: 'none',
    cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  };

  const welcomeStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#718096',
  };

  return (
    <div style={containerStyle}>
      {isOpen && (
        <div style={chatWindowStyle}>
          <div style={headerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bot size={24} />
              <span style={{ fontWeight: 600, fontSize: '16px' }}>{title}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={messagesContainerStyle}>
            {messages.length === 0 ? (
              <div style={welcomeStyle}>
                <Bot size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '15px' }}>
                  안녕하세요! 밸류에이션 AI 튜터입니다.
                </p>
                <p style={{ margin: '8px 0 0', fontSize: '13px' }}>
                  DCF, 상대가치평가, 투자 전략 등<br />
                  궁금한 점을 질문해주세요.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} style={messageStyle(message.role === 'user')}>
                  <div style={avatarStyle(message.role === 'user')}>
                    {message.role === 'user' ? (
                      <User size={16} color="white" />
                    ) : (
                      <Bot size={16} color="white" />
                    )}
                  </div>
                  <div style={bubbleStyle(message.role === 'user')}>{message.content}</div>
                </div>
              ))
            )}
            {isLoading && (
              <div style={messageStyle(false)}>
                <div style={avatarStyle(false)}>
                  <Bot size={16} color="white" />
                </div>
                <div style={{ ...bubbleStyle(false), display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>답변 생성 중...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={inputContainerStyle}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              style={textareaStyle}
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              style={sendButtonStyle}
            >
              {isLoading ? (
                <Loader2 size={20} color="white" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Send size={20} color="white" />
              )}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        style={toggleButtonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 25px rgba(26, 54, 93, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(26, 54, 93, 0.4)';
        }}
      >
        {isOpen ? <X size={28} color="white" /> : <MessageCircle size={28} color="white" />}
      </button>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
