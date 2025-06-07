// src/components/Chat/ChatContainer.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, AssistantSettings, RAGResponse, Source } from '../../types/assistant.types';
import { ENV_CONFIG } from '../../config/environment.config';
import './ChatContainer.css';

interface ChatContainerProps {
  onSendMessage?: (message: string) => Promise<RAGResponse>;
  initialSettings?: Partial<AssistantSettings>;
  className?: string;
  maxHeight?: string;
}

const defaultSettings: AssistantSettings = {
  detailLevel: 'intermediate',
  communicationStyle: 'professional',
  specializations: ['ERP', 'Comarch XL'],
  autoSearch: true,
  useCitations: true,
  language: 'pl',
  maxResponseLength: 2000,
  enabledFeatures: {
    sqlGeneration: true,
    documentAnalysis: true,
    riskAssessment: true,
    costCalculation: true,
  },
};

export const ChatContainer: React.FC<ChatContainerProps> = ({
  onSendMessage,
  initialSettings = {},
  className = '',
  maxHeight = '600px',
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<AssistantSettings>({
    ...defaultSettings,
    ...initialSettings,
  });
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle message sending
  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      let response: RAGResponse;
      
      if (onSendMessage) {
        response = await onSendMessage(messageText);
      } else {
        // Default API call
        response = await sendToAPI(messageText, settings);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.response,
        timestamp: new Date(),
        metadata: {
          confidence: response.confidence,
          sources: response.sources,
          processingTime: response.processingTime,
          model: response.model,
          tokens: response.tokenUsage?.total,
        },
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: `Błąd: ${error instanceof Error ? error.message : 'Nieznany błąd'}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [isLoading, onSendMessage, settings]);

  // Default API call function
  const sendToAPI = async (message: string, userSettings: AssistantSettings): Promise<RAGResponse> => {
    const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        settings: userSettings,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  };

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  }, [input, handleSendMessage]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  // Render message component
  const renderMessage = (message: Message) => (
    <div key={message.id} className={`message message--${message.type}`}>
      <div className="message__content">
        {message.content}
        {message.metadata?.sources && message.metadata.sources.length > 0 && (
          <div className="message__sources">
            <h4>Źródła:</h4>
            {message.metadata.sources.map((source: Source) => (
              <div key={source.id} className="source">
                <span className="source__title">{source.title}</span>
                <span className="source__score">({(source.relevanceScore * 100).toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="message__meta">
        <span className="message__time">
          {message.timestamp.toLocaleTimeString('pl-PL', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
        {message.metadata?.confidence && (
          <span className="message__confidence">
            Pewność: {(message.metadata.confidence * 100).toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className={`chat-container ${className}`} style={{ maxHeight }}>
      <div className="chat-container__header">
        <h3>ERP AI Assistant</h3>
        <span className="chat-container__status">
          {isLoading ? 'Przetwarzanie...' : 'Gotowy'}
        </span>
      </div>

      <div className="chat-container__messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h4>Witaj w ERP AI Assistant!</h4>
            <p>Możesz zapytać o:</p>
            <ul>
              <li>Konfigurację systemu Comarch ERP XL</li>
              <li>Procedury wdrożeniowe</li>
              <li>Analizę danych biznesowych</li>
              <li>Generowanie raportów SQL</li>
            </ul>
          </div>
        )}
        
        {messages.map(renderMessage)}
        
        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>Asystent pisze...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-container__input" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Zadaj pytanie o ERP..."
          disabled={isLoading}
          className="chat-input"
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="chat-send-button"
          aria-label="Wyślij wiadomość"
        >
          {isLoading ? '⏳' : '📤'}
        </button>
      </form>

      <div className="chat-container__footer">
        <small>
          Model: {settings.detailLevel} | 
          Język: {settings.language} | 
          {messages.length} wiadomości
        </small>
      </div>
    </div>
  );
};

export default ChatContainer;
