// src/services/aiService.js
let documentContext = [];

export const setDocumentContext = (context) => {
  documentContext = context;
  console.log("Document context updated:", documentContext.length, "chunks");
};

export const testGeminiAPIConnection = async () => {
  try {
    const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
    
    if (!API_KEY) {
      return { success: false, message: "API key not configured" };
    }
    
    // Use the correct endpoint with the latest model name
    const testEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    const testMessage = "Hello, this is a test message.";
    
    const response = await fetch(
      `${testEndpoint}?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: testMessage }] }]
        })
      }
    );
    
    const statusCode = response.status;
    let responseText = "";
    
    try {
      const responseData = await response.json();
      responseText = JSON.stringify(responseData, null, 2);
    } catch (e) {
      responseText = await response.text();
    }
    
    return {
      success: response.ok,
      statusCode,
      responseText,
      message: response.ok ? "API connection successful" : `API error: ${statusCode}`
    };
  } catch (error) {
    return {
      success: false,
      message: `Connection error: ${error.message}`,
      error
    };
  }
};

export const queryGeminiAI = async (message) => {
  try {
    const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
    
    if (!API_KEY) {
      console.error("Missing Gemini API key. Set REACT_APP_GEMINI_API_KEY in your environment.");
      throw new Error("API key not configured");
    }

    console.log("Using API key starting with:", API_KEY.substring(0, 3) + "..." + API_KEY.slice(-3));

    // Prepare the full prompt
    let fullPrompt = "You are an AI assistant specializing in last mile logistics in India. ";
    fullPrompt += "Provide detailed, accurate information about delivery services, tracking, shipping costs, and logistics coverage areas in India. ";
    fullPrompt += "Be helpful, concise, and focus on Indian logistics context.\n\n";
    fullPrompt += "User question: " + message;
    
    // Add document context if available
    if (documentContext && documentContext.length > 0) {
      fullPrompt += "\n\nReference these document sections when applicable:\n";
      const relevantChunks = documentContext.slice(0, 3);
      relevantChunks.forEach((chunk, i) => {
        fullPrompt += `\nSection ${i+1}: ${chunk}\n`;
      });
      fullPrompt += "\nPlease use this document information when relevant to answer the user's question.";
    }

    // Use the correct endpoint and model name
    // Try gemini-1.5-flash first (current model)
    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    
    // Format the request 
    const requestBody = {
      contents: [
        {
          parts: [
            { text: fullPrompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800
      }
    };
    
    console.log("Sending request to Gemini API at:", apiUrl);
    
    // Send the request
    const response = await fetch(
      `${apiUrl}?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      }
    );

    console.log("API Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      
      if (response.status === 404) {
        // Try fallback to gemini-1.0-pro if 1.5-flash isn't found
        console.log("Model not found, trying fallback to gemini-1.0-pro");
        return await queryWithFallbackModel(fullPrompt, API_KEY);
      } else if (response.status === 403) {
        throw new Error("API access forbidden. Check if API key has correct permissions.");
      } else if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      } else {
        throw new Error(`API error: ${response.status} ${errorText}`);
      }
    }

    const data = await response.json();
    
    // Extract text from the response
    let text = "";
    if (data.candidates && 
        data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts) {
      text = data.candidates[0].content.parts
        .map(part => part.text || "")
        .join("");
      console.log("Successfully extracted text, length:", text.length);
    } else {
      console.warn("Unexpected API response structure:", JSON.stringify(data, null, 2));
      throw new Error("Unexpected API response structure");
    }
    
    return text;
  } catch (error) {
    console.error("Error in Gemini API call:", error);
    throw error;
  }
};

// Fallback function to try different models
async function queryWithFallbackModel(prompt, apiKey) {
  // Try a sequence of models until one works
  const models = [
    "gemini-1.0-pro",
    "gemini-pro",
    "gemini-pro-latest"
  ];
  
  let lastError = null;
  
  for (const model of models) {
    try {
      console.log(`Trying model: ${model}`);
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      
      const requestBody = {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800
        }
      };
      
      const response = await fetch(
        `${fallbackUrl}?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`Model ${model} failed with status:`, response.status, errorText);
        lastError = new Error(`API error with ${model}: ${response.status}`);
        continue; // Try next model
      }
      
      const data = await response.json();
      
      if (data.candidates && 
          data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts) {
        const text = data.candidates[0].content.parts
          .map(part => part.text || "")
          .join("");
        console.log(`Successfully used fallback model: ${model}`);
        return text;
      } else {
        console.warn(`Unexpected response from ${model}:`, JSON.stringify(data, null, 2));
        lastError = new Error(`Unexpected response structure from ${model}`);
        continue; // Try next model
      }
    } catch (error) {
      console.error(`Error with model ${model}:`, error);
      lastError = error;
      // Continue to the next model
    }
  }
  
  // If we get here, all models failed
  throw lastError || new Error("All fallback models failed");
}
