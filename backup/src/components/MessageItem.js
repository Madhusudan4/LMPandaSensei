import React from 'react';

const MessageItem = ({ message }) => {
  const { text, isUser, isError, isFile, timestamp } = message;
  
  // Format timestamp to show only HH:MM
  const formattedTime = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] relative ${
        isUser 
          ? 'bg-red-600 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg' 
          : 'bg-gray-200 text-black rounded-tl-lg rounded-tr-lg rounded-br-lg'
      } ${isError ? 'bg-red-100 border border-red-300' : ''} p-3 shadow-sm`}>
        
        {isFile && (
          <div className="flex items-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs font-medium">Document</span>
          </div>
        )}
        
        <div className="whitespace-pre-wrap">{text}</div>
        
        <div className={`text-xs mt-1 ${isUser ? 'text-gray-200' : 'text-gray-500'} text-right`}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
