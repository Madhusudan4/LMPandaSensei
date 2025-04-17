import React, { useState, useRef, useEffect } from 'react';
import { queryGeminiAI } from '../services/aiService';
import { processDocument } from '../services/documentService';
import MessageItem from './MessageItem';
import LoadingIndicator from './LoadingIndicator';
import FileUpload from './FileUpload';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await queryGeminiAI(input);
      
      const botMessage = {
        text: response,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error getting response:", error);
      
      const errorMessage = {
        text: "I'm having trouble processing your request right now. Please try again later.",
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
        text: `I had trouble processing the document "${file.name}". Please make sure it's a PDF file and try again.`,
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
      {/* Header */}
      <header className="bg-black p-4 text-white">
        <h1 className="text-xl font-bold">Last Mile Logistics Assistant</h1>
        <p className="text-xs text-gray-400">Specializing in Indian logistics solutions</p>
      </header>
      
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
