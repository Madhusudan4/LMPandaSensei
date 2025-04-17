import React, { useState, useRef, useEffect } from 'react';
import { queryGeminiAI } from '../services/aiService';
import { processDocument } from '../services/documentService';
import MessageItem from './MessageItem';
import LoadingIndicator from './LoadingIndicator';
import FileUpload from './FileUpload';
import ApiTester from './ApiTester'; // Make sure ApiTester.js is in the same folder as this file

// A simpler emergency fallback - only used if Gemini API completely fails
async function emergencyFallback(message, error) {
  await new Promise(resolve => setTimeout(resolve, 800));
  console.log("Using emergency fallback due to error:", error);

  // Different responses based on error type
  if (error && error.message && error.message.includes("API key")) {
    return "I'm having trouble connecting to my knowledge services due to an API configuration issue. Please check the API key setup and try again.";
  } else if (error && error.message && error.message.includes("404")) {
    return "I'm experiencing a service endpoint issue. Please verify the API URL is correct and accessible.";
  } else if (error && error.message && error.message.includes("429")) {
    return "I've reached my usage limits for the moment. Please try again in a few minutes.";
  } else {
    return "I'm currently experiencing connection issues with my knowledge database. Please try again in a moment, or contact support if this persists. (Error: " + (error ? error.message : "unknown") + ")";
  }
}

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showApiTester, setShowApiTester] = useState(false); // State for toggling the tester
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add initial greeting message
    setMessages([{
      text: "Hello! I'm your Last Mile Logistics assistant for India. Ask me anything about deliveries, transportation, or upload relevant documents to enhance my knowledge.",
      isUser: false,
      timestamp: new Date().toISOString()
    }]);
  }, []);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;
    
    const userMessage = {
      text: input,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    
    // Save user input before clearing
    const userInput = input;
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      let response;
      let apiError = null;
      
      try {
        // Log that we're attempting API call
        console.log("Attempting Gemini API call for:", userInput);
        
        // Try using the Gemini API
        response = await queryGeminiAI(userInput);
        
        console.log("Received successful API response");
      } catch (error) {
        console.error("Gemini API error:", error);
        apiError = error;
        
        // Use fallback with error details
        response = await emergencyFallback(userInput, error);
      }
      
      const botMessage = {
        text: response,
        isUser: false,
        timestamp: new Date().toISOString(),
        // Flag if this came from fallback
        isFallback: !!apiError
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error getting response:", error);
      
      const errorMessage = {
        text: "I'm having trouble processing your request right now. Please try again later. Error details: " + error.message,
        isUser: false,
        isError: true,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setIsUploading(true);
    
    const uploadMessage = {
      text: `Uploading document: ${file.name}`,
      isUser: true,
      isFile: true,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, uploadMessage]);
    
    try {
      const numChunks = await processDocument(file);
      
      const successMessage = {
        text: `I've processed your document "${file.name}" and extracted ${numChunks} sections of information. You can now ask me questions about its content!`,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, successMessage]);
    } catch (error) {
      console.error("Error processing document:", error);
      
      const errorMessage = {
        text: `I had trouble processing the document "${file.name}". Please make sure it's a PDF, text, or Word file and try again.`,
        isUser: false,
        isError: true,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header with API tester toggle */}
      <header className="bg-black p-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Last Mile Logistics Assistant</h1>
            <p className="text-xs text-gray-400">Specializing in Indian logistics solutions</p>
          </div>
          
          {/* Toggle button for API tester */}
          <button 
            onClick={() => setShowApiTester(!showApiTester)}
            className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600 transition-colors"
          >
            {showApiTester ? "Hide Diagnostics" : "Show Diagnostics"}
          </button>
        </div>
      </header>
      
      {/* API Tester - only shown when toggled */}
      {showApiTester && <ApiTester />}
      
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <MessageItem key={i} message={msg} />
        ))}
        
        {isLoading && 
          <div className="flex justify-start">
            <div className="bg-gray-200 text-black p-3 rounded-lg rounded-bl-none">
              <LoadingIndicator />
            </div>
          </div>
        }
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="border-t border-gray-300 p-4">
        <div className="flex items-center">
          <FileUpload 
            onFileSelect={handleFileUpload} 
            isUploading={isUploading} 
          />
          
          <input 
            className="flex-1 border-0 bg-gray-100 rounded-full px-4 py-2 mx-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Ask about last mile logistics..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={isLoading || isUploading}
          />
          
          <button 
            className={`p-2 rounded-full focus:outline-none ${
              isLoading || isUploading || input.trim() === '' 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
            onClick={handleSend}
            disabled={isLoading || isUploading || input.trim() === ''}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
