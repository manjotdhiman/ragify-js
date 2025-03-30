/**
 * Text chunking utility for RAG
 * Splits text into overlapping chunks while preserving sentence boundaries
 */

import { ChunkingConfig } from "../types";

/**
 * Split text into sentences
 * @param text - The text to split
 * @returns Array of sentences
 */
function splitIntoSentences(text: string): string[] {
  // Basic sentence splitting regex that handles common cases
  const sentenceRegex = /[.!?]+[\s\n]+/g;
  return text.split(sentenceRegex).map(s => s.trim()).filter(Boolean);
}

/**
 * Split text into words
 * @param text - The text to split
 * @returns Array of words
 */
function splitIntoWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/**
 * Join words back into text
 * @param words - Array of words to join
 * @returns Joined text
 */
function joinWords(words: string[]): string {
  return words.join(" ");
}

/**
 * Split text into chunks with optional sentence boundary preservation
 * @param text - The text to chunk
 * @param config - Chunking configuration
 * @returns Array of text chunks
 */
export function chunkText(
  text: string,
  config: ChunkingConfig = { maxTokens: 200, overlap: 50, preserveSentences: true }
): string[] {
  const { maxTokens, overlap, preserveSentences = true } = config;
  const chunks: string[] = [];

  if (preserveSentences) {
    // Split into sentences first
    const sentences = splitIntoSentences(text);
    let currentChunk: string[] = [];
    let currentTokenCount = 0;

    for (const sentence of sentences) {
      const sentenceWords = splitIntoWords(sentence);
      const sentenceTokenCount = sentenceWords.length;

      if (currentTokenCount + sentenceTokenCount > maxTokens) {
        // Current chunk is full, save it and start a new one with overlap
        if (currentChunk.length > 0) {
          chunks.push(joinWords(currentChunk));
        }

        // Start new chunk with overlap from previous chunk
        const overlapWords = currentChunk.slice(-overlap);
        currentChunk = overlapWords;
        currentTokenCount = overlapWords.length;
      }

      currentChunk.push(...sentenceWords);
      currentTokenCount += sentenceTokenCount;
    }

    // Add the last chunk if it's not empty
    if (currentChunk.length > 0) {
      chunks.push(joinWords(currentChunk));
    }
  } else {
    // Simple word-based chunking without sentence preservation
    const words = splitIntoWords(text);
    for (let i = 0; i < words.length; i += (maxTokens - overlap)) {
      const chunk = words.slice(i, i + maxTokens);
      chunks.push(joinWords(chunk));
      if (i + maxTokens >= words.length) break;
    }
  }

  return chunks;
}

/**
 * Estimate the number of tokens in a text
 * @param text - The text to estimate tokens for
 * @returns Estimated number of tokens
 */
export function estimateTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters or 0.75 words
  const wordCount = splitIntoWords(text).length;
  return Math.ceil(wordCount * 0.75);
}
