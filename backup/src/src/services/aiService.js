import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

// Function to query the Gemini model with context from documents
export async function queryGeminiAI(prompt) {
  try {
    // Get stored documents
    const docsString = localStorage.getItem('logisticsDocs') || '[]';
    const docs = JSON.parse(docsString);
    
    // Simple semantic search to find relevant document chunks
    const relevantDocs = findRelevantDocuments(docs, prompt);
    
    // Build context from relevant docs
    const context = buildContextFromDocs(relevantDocs);
    
    // Prepare system instructions
    const systemInstruction = 
      "You are an AI assistant specializing in Last Mile Logistics in India. " +
      "Provide accurate, helpful information related to logistics, supply chain, delivery, " +
      "and transportation in the Indian context. If you don't know the answer, admit it " +
      "rather than making up information. Use professional, clear language and provide " +
      "actionable insights when possible.";
    
    // Build the full prompt with context and system instruction
    const fullPrompt = buildFullPrompt(prompt, context, systemInstruction);

    // Query the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error querying Gemini API:", error);
    throw error;
  }
}

// Helper function to find relevant document chunks based on keyword matching
function findRelevantDocuments(docs, query) {
  // If we don't have many documents, return all of them
  if (docs.length <= 5) return docs;
  
  const queryWords = query.toLowerCase().split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['what', 'when', 'where', 'which', 'how', 'why', 'who', 'this', 'that', 'there', 'their', 'about', 'with'].includes(word));
  
  // Score each document based on keyword matches
  const scoredDocs = docs.map(doc => {
    const content = doc.content.toLowerCase();
    let score = 0;
    
    // Score based on number of query words present in the document
    for (const word of queryWords) {
      if (content.includes(word)) {
        score += 1;
        
        // Bonus points for documents with words in close proximity
        if (queryWords.length > 1) {
          const otherWords = queryWords.filter(w => w !== word);
          for (const otherWord of otherWords) {
            const idx1 = content.indexOf(word);
            const idx2 = content.indexOf(otherWord);
            if (idx1 >= 0 && idx2 >= 0 && Math.abs(idx1 - idx2) < 50) {
              score += 0.5;
            }
          }
        }
      }
    }
    
    return { doc, score };
  });
  
  // Sort by score and take the top 3
  return scoredDocs
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .filter(item => item.score > 0)
    .map(item => item.doc);
}

// Helper function to build context from documents
function buildContextFromDocs(docs) {
  if (docs.length === 0) return '';
  
  return docs.map((doc, index) => {
    return `Document ${index + 1}:\n${doc.content}`;
  }).join('\n\n');
}

// Helper function to build the full prompt
function buildFullPrompt(prompt, context, systemInstruction) {
  let fullPrompt = systemInstruction + "\n\n";
  
  if (context) {
    fullPrompt += "Here is some context about Indian last mile logistics that may help answer the query:\n\n" +
                 context + "\n\n";
  }
  
  fullPrompt += "User query: " + prompt;
  return fullPrompt;
}
