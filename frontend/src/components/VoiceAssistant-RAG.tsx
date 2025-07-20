'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, MessageCircle, X, Send, Loader2, ShoppingBag, Search, Star } from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  products?: ProductResult[];
  context_type?: string;
}

interface ProductResult {
  product_id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  similarity: number;
  brand?: string;
  image_url?: string;
}

interface RAGResponse {
  response: string;
  products_found: number;
  similar_products: ProductResult[];
  context_type: string;
  success: boolean;
}

const VoiceAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI shopping assistant. I can help you find products, compare items, answer questions about your orders, and provide personalized recommendations. Try asking me something like "Show me running shoes under $100" or "What\'s the best laptop for students?"',
      isUser: false,
      timestamp: new Date(),
      context_type: 'greeting'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      if (transcript.trim()) {
        handleSendMessage(transcript);
        resetTranscript();
      }
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setTextInput('');

    try {
      // Call our RAG system endpoint via proxy
      const response = await fetch('/api/rag-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: messageText,
          context_type: determineContextType(messageText)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI assistant');
      }

      const ragResponse: RAGResponse = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: ragResponse.response,
        isUser: false,
        timestamp: new Date(),
        products: ragResponse.similar_products,
        context_type: ragResponse.context_type
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling RAG system:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment, or feel free to browse our products directly.',
        isUser: false,
        timestamp: new Date(),
        context_type: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const determineContextType = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('compare') || lowerMessage.includes('vs') || lowerMessage.includes('versus')) {
      return 'comparison';
    }
    
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('best')) {
      return 'recommendation';
    }
    
    if (lowerMessage.includes('order') || lowerMessage.includes('shipping') || lowerMessage.includes('return')) {
      return 'inquiry';
    }
    
    return 'general';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getRelevanceColor = (similarity: number) => {
    if (similarity >= 0.8) return 'text-emerald-600';
    if (similarity >= 0.6) return 'text-amber-600';
    return 'text-orange-600';
  };

  const getRelevanceText = (similarity: number) => {
    if (similarity >= 0.8) return 'Highly Relevant';
    if (similarity >= 0.6) return 'Relevant';
    return 'Somewhat Relevant';
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 z-50"
        aria-label="Open AI Assistant"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl flex flex-col z-50 border border-slate-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShoppingBag size={20} />
          <div>
            <h3 className="font-semibold">AI Shopping Assistant</h3>
            <p className="text-xs opacity-90">Powered by RAG + Vector Search</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-white hover:bg-opacity-20 p-1 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              message.isUser 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white' 
                : 'bg-slate-100 text-slate-800'
            }`}>
              <p className="text-sm">{message.text}</p>
              
              {/* Product Results */}
              {message.products && message.products.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold text-slate-600 border-t border-slate-300 pt-2">
                    {message.products.length} Product{message.products.length > 1 ? 's' : ''} Found:
                  </p>
                  {message.products.slice(0, 3).map((product) => (
                    <div key={product.product_id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-slate-900">{product.name}</h4>
                          <p className="text-xs text-slate-600">{product.category}</p>
                          <p className="text-sm font-semibold text-emerald-600">{formatPrice(product.price)}</p>
                        </div>
                        <div className="text-xs">
                          <div className={`flex items-center space-x-1 ${getRelevanceColor(product.similarity)}`}>
                            <Star size={12} fill="currentColor" />
                            <span>{getRelevanceText(product.similarity)}</span>
                          </div>
                          <span className="text-slate-500">{(product.similarity * 100).toFixed(0)}% match</span>
                        </div>
                      </div>
                      {product.description && (
                        <p className="text-xs text-slate-600 mt-2 line-clamp-2">{product.description}</p>
                      )}
                    </div>
                  ))}
                  {message.products.length > 3 && (
                    <p className="text-xs text-slate-500 italic">+ {message.products.length - 3} more products found</p>
                  )}
                </div>
              )}
              
              <p className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-3 rounded-lg flex items-center space-x-2">
              <Loader2 size={16} className="animate-spin text-emerald-600" />
              <span className="text-sm text-slate-600">AI is thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recording Overlay */}
      {listening && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 bg-opacity-95 flex items-center justify-center rounded-xl">
          <div className="text-center text-white">
            <div className="w-20 h-20 bg-white bg-opacity-30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Mic size={32} />
            </div>
            <p className="text-lg font-semibold">Listening...</p>
            <p className="text-sm opacity-90">Speak your question</p>
            {transcript && (
              <div className="mt-4 p-3 bg-white bg-opacity-20 rounded-lg">
                <p className="text-sm">"{transcript}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(textInput)}
            placeholder="Ask about products, orders, or get recommendations..."
            className="flex-1 p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage(textInput)}
            disabled={isLoading || !textInput.trim()}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:bg-slate-400 text-white p-2 rounded-lg transition-colors"
          >
            <Send size={16} />
          </button>
          {browserSupportsSpeechRecognition && (
            <button
              onClick={toggleListening}
              className={`p-2 rounded-lg transition-colors ${
                listening 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white' 
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
              disabled={isLoading}
            >
              {listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="mt-2 flex flex-wrap gap-1">
          {['Best laptops under $800', 'Compare phones', 'Track my order', 'Recommended for me'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSendMessage(suggestion)}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded transition-colors"
              disabled={isLoading}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
