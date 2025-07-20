"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Send,
  Bot,
  User,
  X,
  Trash2,
} from "lucide-react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// AI response using API route
const generateResponse = async (message: string): Promise<string> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from chat API');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Chat API returned error');
    }

    return data.response;
  } catch (error) {
    console.error('Chat API error:', error);
    throw new Error('Sorry, I encountered an issue processing your request. Please try again.');
  }
};

const VoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [audioError, setAudioError] = useState<string | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Fix hydration error
  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    if (!browserSupportsSpeechRecognition) {
      console.warn("Speech recognition not available");
      setAudioError('Voice recording is not available in this browser');
      setTimeout(() => setAudioError(null), 3000);
      return;
    }

    // Check for microphone permissions
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error("Microphone permission denied:", error);
      alert('Microphone permission is required for voice recording');
      return;
    }

    resetTranscript();
    setIsRecording(true);
    
    try {
      SpeechRecognition.startListening({ 
        continuous: true,
        language: 'en-US'
      });
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      setIsRecording(false);
      alert('Failed to start voice recording');
    }
  };

  const stopRecording = () => {
    if (!browserSupportsSpeechRecognition) {
      return;
    }
    
    setIsRecording(false);
    SpeechRecognition.stopListening();

    if (transcript.trim()) {
      sendMessage(transcript);
    }
  };

  const cancelRecording = () => {
    if (!browserSupportsSpeechRecognition) {
      return;
    }
    
    setIsRecording(false);
    SpeechRecognition.stopListening();
    resetTranscript();
  };

  const sendMessage = async (messageContent: string) => {
    if (!mounted) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);
    setAudioError(null);

    try {
      // Generate AI response
      const response = await generateResponse(messageContent);

      // Show text response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsThinking(false);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsThinking(false);

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: "assistant",
        content: "Sorry, I'm experiencing technical difficulties. Please try again later.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    }

    resetTranscript();
  };

  const sendTextMessage = async () => {
    if (!textInput.trim() || isThinking) return;

    const messageContent = textInput.trim();
    setTextInput("");
    await sendMessage(messageContent);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setTextInput("");
    setAudioError(null);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
      {!isOpen && (
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-slate-700/30 animate-[pulse_1s_ease-in-out_infinite] scale-110"></div>
          <div className="absolute inset-0 rounded-full bg-slate-600/20 animate-[ping_1.4s_cubic-bezier(0.4,0,0.2,1)_infinite] scale-100"></div>

          <Button
            onClick={() => setIsOpen(true)}
            className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-800 hover:bg-slate-700 text-white shadow-xl hover:shadow-2xl transition-transform duration-400 ease-out hover:scale-105 border hover:border-slate-400/50"
            title="Voice & Text Assistant"
          >
            <Mic className="w-14 h-14 md:w-16 md:h-16 transition-transform duration-300 ease-in-out" />
          </Button>
        </div>
      )}

      {/* Recording Overlay - Within Chat Container */}
      {isRecording && isOpen && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-[70] flex items-center justify-center rounded-2xl">
          <div className="text-center space-y-4 md:space-y-6 px-4">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-75"></div>
                <div className="absolute inset-1 rounded-full border border-red-400 animate-pulse"></div>
                <Mic className="w-6 h-6 md:w-8 md:h-8 text-white z-10" />
              </div>
            </div>

            <div className="space-y-2 md:space-y-3">
              <h3 className="text-base md:text-lg font-semibold text-white">
                Recording {formatTime(recordingTime)}
              </h3>
              {transcript && (
                <div className="max-w-xs mx-auto">
                  <p className="text-sm text-slate-300 leading-relaxed line-clamp-3 break-words">
                    {transcript}
                  </p>
                </div>
              )}

              <p className="text-xs text-slate-400">Speak clearly and click send when finished</p>
            </div>

            <div className="flex items-center justify-center space-x-3">
              <Button
                onClick={cancelRecording}
                className="w-10 h-10 md:w-10 md:h-10 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                title="Cancel Recording"
              >
                <X className="w-4 h-4" />
              </Button>
              <Button
                onClick={stopRecording}
                className="w-10 h-10 md:w-10 md:h-10 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div
          className={`
          bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 
          flex flex-col overflow-hidden relative
          w-[calc(100vw-2rem)] h-[calc(100vh-8rem)] 
          max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)]
          sm:w-[calc(100vw-3rem)] sm:h-[calc(100vh-6rem)]
          sm:max-w-[calc(100vw-3rem)] sm:max-h-[calc(100vh-6rem)]
          md:w-96 md:h-[600px] 
          md:max-w-96 md:max-h-[600px]
          lg:w-96 lg:h-[600px]
        `}
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-3 md:p-4 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-teal-600">
                <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white truncate text-sm md:text-base">
                  Shopping Assistant
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full flex-shrink-0 bg-green-500"></div>
                  <p className="text-xs text-slate-400 truncate">
                    Online
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
              {messages.length > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-slate-400 font-medium">
                    {messages.length}
                  </span>
                  <Button
                    onClick={clearMessages}
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-red-400 hover:bg-slate-700 w-6 h-6 md:w-7 md:h-7 p-0"
                    title="Clear All Messages"
                  >
                    <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  </Button>
                </div>
              )}

              <Button
                onClick={() => {
                  setIsOpen(false);
                  setTextInput("");
                  if (isRecording) {
                    cancelRecording();
                  }
                }}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white hover:bg-slate-700 w-6 h-6 md:w-7 md:h-7 p-0"
                title="Close Chat"
              >
                <X className="w-3 h-3 md:w-3.5 md:h-3.5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-slate-900">
            {messages.length === 0 && (
              <div className="text-center py-6 md:py-8">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-teal-600">
                  <Bot className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-300 mb-2 px-4">
                  Hi! I'm your shopping assistant. How can I help you today?
                </p>
                <p className="text-xs text-slate-400 px-4">
                  You can type your message or use voice recording
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex space-x-2 max-w-[85%] md:max-w-[80%] ${
                    message.type === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <div
                    className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === "user" ? "bg-blue-600" : "bg-teal-600"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                    ) : (
                      <Bot className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-3 py-2 ${
                      message.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 border border-slate-700 text-slate-200"
                    }`}
                  >
                    <p className="text-sm leading-relaxed break-words">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        message.type === "user"
                          ? "text-blue-100"
                          : "text-slate-500"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2 py-2 px-3 bg-slate-800 rounded-2xl border border-slate-700">
                  <span className="text-teal-400 font-medium text-sm">
                    Thinking
                  </span>
                  <div className="flex space-x-1">
                    <div
                      className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Audio Error Display */}
          {audioError && (
            <div className="px-3 md:px-4 py-2 bg-slate-800 border-t border-slate-700">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="font-medium text-sm text-red-400">
                  {audioError}
                </span>
              </div>
            </div>
          )}

          {/* Control Panel */}
          <div className="bg-slate-800 border-t border-slate-700 p-3 md:p-4">
            {/* Text Input */}
            <div className="flex items-center space-x-2 mb-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  disabled={isThinking}
                  className="w-full bg-gray-900 border border-slate-600 rounded-lg px-3 py-2 pr-8 text-sm text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50"
                />
                {textInput && (
                  <Button
                    onClick={() => setTextInput("")}
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 p-0 text-slate-400 hover:text-white hover:bg-slate-600 rounded"
                    title="Clear Input"
                  >
                    <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  </Button>
                )}
              </div>
              <Button
                onClick={sendTextMessage}
                disabled={!textInput.trim() || isThinking}
                className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </Button>
            </div>

            {/* Voice Control */}
            <div className="flex items-center justify-center space-x-3">
              <Button
                onClick={startRecording}
                disabled={isThinking || isRecording}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                title="Start Voice Recording"
              >
                <Mic className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </div>

            <div className="text-center mt-2">
              <p className="text-xs text-slate-500">
                {isRecording
                  ? `Recording ${formatTime(recordingTime)}`
                  : "Type your message or click the microphone to record"
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
