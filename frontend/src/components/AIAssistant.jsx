import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  Loader2,
  Lightbulb,
  MapPin,
  Clock,
  CheckCircle
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hi! I'm your CityWatch AI assistant. I can help you with reporting issues, finding information, and answering questions about our platform. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Simulate AI response (in real implementation, this would call your AI service)
      const aiResponse = await generateAIResponse(inputValue);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse.content,
        suggestions: aiResponse.suggestions,
        timestamp: new Date()
      };

      setTimeout(() => {
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (userInput) => {
    // This is a mock AI response generator
    // In a real implementation, this would call your AI service
    const input = userInput.toLowerCase();

    if (input.includes('report') || input.includes('issue') || input.includes('problem')) {
      return {
        content: "I can help you report an issue! Here's how to get started:",
        suggestions: [
          { text: "How to report a pothole", action: "report_pothole" },
          { text: "Report broken streetlight", action: "report_streetlight" },
          { text: "Report garbage issue", action: "report_garbage" },
          { text: "Report water leak", action: "report_water" }
        ]
      };
    }

    if (input.includes('status') || input.includes('check') || input.includes('track')) {
      return {
        content: "I can help you check the status of your reports. You can view all your reports in the dashboard or I can help you find specific information.",
        suggestions: [
          { text: "View my reports", action: "view_reports" },
          { text: "Check report status", action: "check_status" },
          { text: "Get updates", action: "get_updates" }
        ]
      };
    }

    if (input.includes('help') || input.includes('how')) {
      return {
        content: "I'm here to help! I can assist you with reporting issues, checking status, finding information, and answering questions about CityWatch.",
        suggestions: [
          { text: "How to use CityWatch", action: "tutorial" },
          { text: "Report an issue", action: "report_issue" },
          { text: "Contact support", action: "contact_support" }
        ]
      };
    }

    if (input.includes('time') || input.includes('response') || input.includes('how long')) {
      return {
        content: "Our average response time is 2.4 hours, with 95% of issues resolved within 48 hours. Emergency issues like power outages or water leaks are prioritized and typically resolved within 4-6 hours.",
        suggestions: [
          { text: "Report emergency issue", action: "emergency_report" },
          { text: "Check response times", action: "response_times" }
        ]
      };
    }

    // Default response
    return {
      content: "I understand you're asking about: \"" + userInput + "\". I can help you with reporting issues, checking status, finding information, or answering questions about CityWatch. Could you be more specific about what you need help with?",
      suggestions: [
        { text: "Report an issue", action: "report_issue" },
        { text: "Check my reports", action: "check_reports" },
        { text: "Get help", action: "get_help" }
      ]
    };
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.text);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        aria-label="Open AI Assistant"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-t-xl shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      AI Assistant
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Online • Ready to help
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-xs ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user' 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        
                        {/* Suggestions */}
                        {message.suggestions && (
                          <div className="mt-3 space-y-2">
                            {message.suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="block w-full text-left text-xs p-2 bg-white dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded border hover:bg-neutral-50 dark:hover:bg-neutral-500 transition-colors"
                              >
                                {suggestion.text}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        <p className={`text-xs mt-2 ${
                          message.type === 'user' 
                            ? 'text-primary-100' 
                            : 'text-neutral-500 dark:text-neutral-400'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      </div>
                      <div className="bg-neutral-100 dark:bg-neutral-700 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
                          <span className="text-sm text-neutral-500">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about CityWatch..."
                    className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    size="sm"
                    className="px-3"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
