import * as pdfjs from 'pdfjs-dist';
import { splitTextIntoChunks } from '../utils/textProcessing';

// Set the worker path for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// Function to process a PDF document
export async function processDocument(file) {
  try {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const text = await extractTextFromPDF(arrayBuffer);
    const chunks = splitTextIntoChunks(text);
    
    // Store document chunks in localStorage
    storeDocumentChunks(chunks);
    
    return chunks.length;
  } catch (error) {
    console.error("Error processing document:", error);
    throw error;
  }
}

// Helper function to read file as ArrayBuffer
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// Helper function to extract text from PDF using PDF.js
async function extractTextFromPDF(arrayBuffer) {
  try {
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
    }
    
    return fullText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw error;
  }
}

// Helper function to store document chunks in localStorage
function storeDocumentChunks(chunks) {
  // Get existing documents
  const existingDocsString = localStorage.getItem('logisticsDocs') || '[]';
  const existingDocs = JSON.parse(existingDocsString);
  
  // Prepare new document chunks with metadata
  const newDocs = chunks.map((chunk, index) => ({
    id: `doc_${Date.now()}_${index}`,
    content: chunk,
    metadata: {
      source: 'uploaded_pdf',
      timestamp: new Date().toISOString(),
      chunkIndex: index
    }
  }));
  
  // Combine existing and new docs (cap at 100 docs to prevent localStorage overflow)
  const allDocs = [...existingDocs, ...newDocs].slice(-100);
  
  // Store in localStorage
  localStorage.setItem('logisticsDocs', JSON.stringify(allDocs));
}
