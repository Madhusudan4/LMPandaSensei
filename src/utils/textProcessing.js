// Function to split text into reasonably-sized chunks
export function splitTextIntoChunks(text, maxChunkSize = 1000, overlap = 200) {
    // Clean up the text - remove excessive whitespace
    const cleanedText = text.replace(/\s+/g, ' ').trim();
    
    // If text is short enough, return it as a single chunk
    if (cleanedText.length <= maxChunkSize) {
      return [cleanedText];
    }
    
    const chunks = [];
    let startIndex = 0;
    
    while (startIndex < cleanedText.length) {
      let endIndex = startIndex + maxChunkSize;
      
      // If we're not at the end of the text, try to break at a sentence boundary
      if (endIndex < cleanedText.length) {
        // Look backward from maxChunkSize for a sentence boundary
        const sentenceEndMatch = cleanedText.substring(startIndex, endIndex + 1)
          .match(/[.!?]\s+[A-Z][^.!?]*$/);
        
        if (sentenceEndMatch) {
          // Adjust the endIndex to the end of the last complete sentence
          endIndex = startIndex + sentenceEndMatch.index + 1;
        } else {
          // If no sentence boundary found, look for a space
          const lastSpace = cleanedText.substring(startIndex, endIndex + 1).lastIndexOf(' ');
          if (lastSpace > 0) {
            endIndex = startIndex + lastSpace;
          }
        }
      } else {
        // If we're at the end of the text, just use the remaining text
        endIndex = cleanedText.length;
      }
      
      // Extract the chunk and add it to the array
      chunks.push(cleanedText.substring(startIndex, endIndex).trim());
      
      // Move the start index for the next chunk, including overlap
      startIndex = Math.min(endIndex, startIndex + maxChunkSize - overlap);
    }
    
    return chunks;
  }
  