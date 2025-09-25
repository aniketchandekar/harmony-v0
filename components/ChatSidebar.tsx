import React, { useState, useRef, useEffect } from "react";
import { XMarkIcon, PaperAirplaneIcon, SparkleIcon } from "./Icons";
import { AnalysisSection } from "./AnalysisDisplay";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  implementationPlan: AnalysisSection[];
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onClose,
  implementationPlan,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Dynamically import chat service
      const { chatAboutImplementation } = await import(
        "../services/geminiService"
      );
      const response = await chatAboutImplementation(
        userMessage.content,
        implementationPlan,
        messages
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* Mobile overlay with fade animation */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/25 backdrop-blur-sm transition-all duration-500 ease-out ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Sidebar with enhanced animations - always rendered for smooth transitions */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-96 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col transform transition-all duration-500 ease-out ${
          isOpen
            ? "translate-x-0 opacity-100 visible"
            : "translate-x-full opacity-0 invisible"
        }`}
      >
        {/* Header with slide-in animation */}
        <div
          className={`flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 transform transition-all duration-700 delay-100 header-slide ${
            isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="flex items-center space-x-2">
            <SparkleIcon className="w-5 h-5 text-indigo-600 animate-pulse" />
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              AI Assistant
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-110"
            aria-label="Close chat sidebar"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages with enhanced animations */}
        <div
          className={`flex-1 overflow-y-auto p-4 space-y-4 transform transition-all duration-700 delay-200 ${
            isOpen ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          {messages.length === 0 && (
            <div
              className={`text-center text-slate-500 dark:text-slate-400 py-8 transform transition-all duration-1000 delay-300 ${
                isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
              }`}
            >
              <SparkleIcon className="w-8 h-8 mx-auto mb-2 opacity-50 animate-pulse" />
              <p className="text-sm">
                Ask me about your implementation plan, web platform features,
                browser compatibility, or best practices!
              </p>
              {implementationPlan.length > 0 && (
                <p className="text-xs mt-2 opacity-75">
                  I have context about your current analysis with{" "}
                  {implementationPlan.length} sections.
                </p>
              )}
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } animate-bounceIn`}
              style={{
                animationDelay: `${Math.min(index * 100, 500)}ms`,
              }}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 message-bubble transform transition-all duration-300 hover:scale-105 ${
                  message.role === "user"
                    ? "bg-indigo-600 text-white shadow-lg hover:shadow-xl hover:bg-indigo-700"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-md hover:shadow-lg hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
                <div
                  className={`text-xs mt-1 opacity-70 transition-opacity duration-200 ${
                    message.role === "user"
                      ? "text-indigo-200"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-fadeIn">
              <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-2 max-w-[80%] shadow-md message-bubble">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot"></div>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 animate-pulse">
                    AI is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area with enhanced animations */}
        <div
          className={`p-4 border-t border-slate-200 dark:border-slate-700 transform transition-all duration-700 delay-400 ${
            isOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about implementation details, browser support, best practices..."
                className="w-full resize-none rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent max-h-32 chat-input transition-all duration-300 focus:shadow-lg"
                rows={1}
                disabled={isLoading}
                style={{
                  minHeight: "40px",
                  height: "auto",
                  lineHeight: "1.4",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(
                    target.scrollHeight,
                    128
                  )}px`;
                }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className={`send-button flex-shrink-0 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transform transition-all duration-300 hover:scale-110 active:scale-95 ${
                isLoading ? "animate-pulse" : "hover:shadow-lg"
              }`}
              aria-label="Send message"
            >
              <PaperAirplaneIcon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isLoading ? "animate-spin" : "hover:rotate-12"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Press Enter to send, Shift+Enter for new line
            </p>
            {implementationPlan.length > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Context: {implementationPlan.length} sections loaded
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;
