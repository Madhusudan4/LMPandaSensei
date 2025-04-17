// src/components/ApiTester.js
import React, { useState } from 'react';
import { testGeminiAPIConnection } from '../services/aiService';

const ApiTester = () => {
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const runTest = async () => {
    setIsLoading(true);
    try {
      const result = await testGeminiAPIConnection();
      setTestResult(result);
      console.log("API Test result:", result);
    } catch (error) {
      setTestResult({ success: false, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-3 border rounded my-2 text-sm bg-gray-50">
      <div className="flex justify-between items-center">
        <div className="font-semibold">API Connection Troubleshooter</div>
        <button 
          onClick={runTest} 
          disabled={isLoading}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          {isLoading ? "Testing..." : "Test API Connection"}
        </button>
      </div>
      
      {testResult && (
        <div className="mt-2">
          <div className={`font-bold ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
            {testResult.success ? '✅ Connection Successful' : '❌ Connection Failed'}
          </div>
          <div className="mt-1">{testResult.message}</div>
          
          {testResult.statusCode && (
            <div>Status code: {testResult.statusCode}</div>
          )}
          
          {testResult.responseText && (
            <div className="mt-2">
              <div className="font-semibold">Response:</div>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40 mt-1">
                {testResult.responseText}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiTester;
