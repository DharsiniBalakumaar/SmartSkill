// File: ./utils/keywordGenerator.js

// Simple list of common English stop words
const stopWords = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'has', 'have', 'had',
  'in', 'on', 'at', 'by', 'for', 'with', 'of', 'to', 'from', 'as', 'it', 'its', 'which',
  'that', 'this', 'these', 'those', 'must', 'should', 'would', 'could', 'can', 'will',
  'what', 'when', 'where', 'who', 'why', 'how', 'do', 'does', 'did', 'not', 'no', 'yes',
  'be', 'been', 'being', 'about', 'just', 'only', 'so', 'then', 'than', 'them', 'they',
  'i', 'me', 'my', 'you', 'your', 'we', 'our', 'us'
]);

/**
 * Generates keywords from a given text (Justification/Explanation).
 * @param {string} text - The input text to process.
 * @returns {string[]} An array of unique, filtered keywords.
 */
function generateKeywords(text) {
  if (!text) return [];

  // 1. Convert to lowercase, remove common punctuation, and replace multiple spaces
  const processedText = text.toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()'"?]/g, '') 
    .replace(/\s{2,}/g, ' ');

  // 2. Split into words
  const words = processedText.split(/\s+/);

  // 3. Filter out stop words and short words (< 3 characters)
  const filteredWords = words.filter(word =>
    word.length >= 3 && !stopWords.has(word)
  );

  // 4. Use a Set to get unique words and return the array
  const uniqueKeywords = [...new Set(filteredWords)];

  return uniqueKeywords;
}

module.exports = generateKeywords;