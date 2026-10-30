import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  X,
  Smile,
  Zap,
  Sparkles,
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface InGameChatProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  currentUserId: string;
  currentUserName: string;
  onSendMessage: (text: string) => void;
  gameThemeColor?: string; // e.g. '#10b981' for Bhabhi, '#06b6d4' for Undercover, '#f59e0b' for Spyfall
}

const QUICK_REACTIONS = [
  'GG! 👏',
  'Nice move! 🃏',
  'Wait for me! ⏳',
  'Suspicious... 🧐',
  'Hahaha 😂',
  'Fire! 🔥',
  'Oops! 🙈',
  'Ready to win! 👑',
];

export default function InGameChat({
  isOpen,
  onClose,
  messages = [],
  currentUserId,
  currentUserName,
  onSendMessage,
  gameThemeColor = '#10b981',
}: InGameChatProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean) return;
    onSendMessage(clean);
    setInputText('');
  };

  const handleQuickReaction = (emojiText: string) => {
    onSendMessage(emojiText);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background: 'rgba(3, 7, 18, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          height: 'min(640px, 90vh)',
          background: '#0d131f',
          border: '1.5px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85)',
          position: 'relative',
        }}
      >
        {/* Chat Drawer Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(15, 23, 42, 0.85)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: `${gameThemeColor}22`,
                border: `1.5px solid ${gameThemeColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: gameThemeColor,
              }}
            >
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                Room Text Chat
              </h3>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                Instant real-time room communication
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              padding: '6px',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
            title="Close Chat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages Scroll Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {messages.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 'auto 0',
                color: '#64748b',
                textAlign: 'center',
                gap: '8px',
              }}
            >
              <Smile size={32} color="#475569" />
              <p style={{ fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>
                No messages yet in this room.
              </p>
              <span style={{ fontSize: '0.76rem', color: '#475569' }}>
                Say hello or tap a quick reaction below!
              </span>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '3px',
                      fontSize: '0.72rem',
                      color: isMe ? gameThemeColor : '#94a3b8',
                      fontWeight: 700,
                    }}
                  >
                    <span>{isMe ? 'You' : msg.senderName}</span>
                    <span style={{ fontSize: '0.66rem', color: '#64748b' }}>{formattedTime}</span>
                  </div>

                  <div
                    style={{
                      maxWidth: '82%',
                      padding: '10px 14px',
                      borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                      background: isMe ? gameThemeColor : 'rgba(255, 255, 255, 0.08)',
                      color: isMe ? '#ffffff' : '#f1f5f9',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      wordBreak: 'break-word',
                      lineHeight: 1.4,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reactions Bar */}
        <div
          style={{
            padding: '8px 16px',
            background: 'rgba(15, 23, 42, 0.6)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {QUICK_REACTIONS.map((reaction) => (
            <button
              key={reaction}
              type="button"
              onClick={() => handleQuickReaction(reaction)}
              style={{
                flexShrink: 0,
                padding: '4px 10px',
                borderRadius: '999px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#cbd5e1',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.borderColor = gameThemeColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              {reaction}
            </button>
          ))}
        </div>

        {/* Message Input Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: 'rgba(15, 23, 42, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            maxLength={140}
            style={{
              flex: 1,
              padding: '11px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 500,
              outline: 'none',
            }}
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{
              padding: '11px 16px',
              borderRadius: '12px',
              background: inputText.trim() ? gameThemeColor : 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: 'none',
              cursor: inputText.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease',
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

