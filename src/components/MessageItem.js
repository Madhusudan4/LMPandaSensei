// src/components/MessageItem.js
import React from 'react';

const MessageItem = ({ message }) => {
  const { text, isUser, isError, isFile, timestamp } = message;
  
  // Format timestamp for display
  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Determine message style based on type
  const messageStyle = isUser
    ? "flex justify-end mb-4"
    : "flex justify-start mb-4";
    
  const bubbleStyle = isUser
    ? "bg-blue-600 text-white p-3 rounded-lg rounded-br-none max-w-[75%]"
    : isError
      ? "bg-red-100 text-red-800 p-3 rounded-lg rounded-bl-none max-w-[75%]"
      : "bg-gray-200 text-black p-3 rounded-lg rounded-bl-none max-w-[75%]";
      
  const fileStyle = isFile
    ? "flex items-center"
    : "";
    
  // Process text content for display
  const formattedText = text.split('\n').map((line, i) => (
    <React.Fragment key={i}>
      {line}
      {i < text.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));

  return (
    <div className={messageStyle}>
      <div className={`${bubbleStyle} ${fileStyle} shadow-sm`}>
        {isFile && (
          <span className="mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
            </svg>
          </span>
        )}
        {formattedText}
        <span className="text-xs opacity-70 ml-2 self-end">{formattedTime}</span>
      </div>
    </div>
  );
};

export default MessageItem;
