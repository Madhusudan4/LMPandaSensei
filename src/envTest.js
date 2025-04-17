// src/envTest.js
import React, { useEffect, useState } from 'react';

const EnvTest = () => {
  const [envStatus, setEnvStatus] = useState({});
  
  useEffect(() => {
    const checkEnv = () => {
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      setEnvStatus({
        apiKeyExists: !!apiKey,
        apiKeyLength: apiKey ? apiKey.length : 0,
        apiKeyStart: apiKey ? apiKey.substring(0, 3) + "..." : "none",
        nodeEnv: process.env.NODE_ENV
      });
    };
    
    checkEnv();
  }, []);
  
  return (
    <div className="p-4 bg-gray-100 rounded mb-4">
      <h3 className="font-bold">Environment Variables Check:</h3>
      <ul>
        <li>API Key exists: {envStatus.apiKeyExists ? "✅" : "❌"}</li>
        <li>API Key length: {envStatus.apiKeyLength}</li>
        <li>API Key starts with: {envStatus.apiKeyStart}</li>
        <li>NODE_ENV: {envStatus.nodeEnv}</li>
      </ul>
      <p className="mt-2 text-sm text-gray-600">
        If API key is missing, make sure your .env file is correctly set up with REACT_APP_GEMINI_API_KEY
      </p>
    </div>
  );
};

export default EnvTest;
