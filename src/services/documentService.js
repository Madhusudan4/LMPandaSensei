// src/services/documentService.js
import { setDocumentContext } from './aiService';

export const processDocument = async (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // For demonstration we'll simulate document text extraction
          // In a real app, you'd have more sophisticated document parsing
          const content = e.target.result;
          
          // Basic document chunking - split by paragraphs and sections
          let chunks = [];
          
          if (file.type === 'application/pdf') {
            // Simulate PDF processing
            chunks = simulatePdfProcessing(content);
          } else if (file.type.includes('text')) {
            // Process text files
            chunks = content.split('\n\n')
              .filter(chunk => chunk.trim().length > 0);
          } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
            // Simulate Word document processing
            chunks = simulateWordProcessing(content);
          } else {
            // Generic text extraction
            chunks = content.split('\n')
              .filter(chunk => chunk.trim().length > 0);
          }
          
          // Update the AI service with document context
          setDocumentContext(chunks);
          
          resolve(chunks.length);
        } catch (error) {
          console.error("Error processing document content:", error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error("Failed to read the file"));
      };
      
      // Read the file based on type
      if (file.type === 'application/pdf' || file.type.includes('word') || file.type.includes('application/vnd.openxmlformats-officedocument')) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    } catch (error) {
      console.error("Error setting up document processing:", error);
      reject(error);
    }
  });
};

// Simulation functions for document processing
function simulatePdfProcessing(content) {
  // This is a placeholder. In a real app, you'd use a PDF.js or similar library
  // For now, we'll create fake chunks based on the file size
  const chunks = [];
  const size = content.byteLength;
  const numChunks = Math.max(3, Math.min(10, Math.floor(size / 5000)));
  
  for (let i = 0; i < numChunks; i++) {
    chunks.push(`[Document section ${i+1}] This section contains logistics information about shipping routes, delivery timeframes, and package handling procedures for the Indian market. Key points include delivery standards, shipping zones, and logistics operations.`);
  }
  
  return chunks;
}

function simulateWordProcessing(content) {
  // Placeholder for Word document processing
  const chunks = [];
  const size = content.byteLength;
  const numChunks = Math.max(3, Math.min(8, Math.floor(size / 4000)));
  
  for (let i = 0; i < numChunks; i++) {
    chunks.push(`[Document section ${i+1}] This section contains logistics information about delivery processes, customer service protocols, and last-mile delivery operations in India. Topics include urban delivery strategies, rural logistics challenges, and delivery scheduling procedures.`);
  }
  
  return chunks;
}
