/**
 * Syllable Processor Web Worker
 * 
 * Processes text using the hyphen library to count syllables without blocking the main thread.
 * Uses Franklin Liang's hyphenation algorithm to detect syllable boundaries.
 */

import { hyphenateSync } from 'hyphen/de';
import type { WorkerRequest, WorkerResponse, SyllableData, WordSyllables } from '../types';

// Simple, self-contained logger for worker environment
// In production builds, this will be tree-shaken if unused
const isDevelopment = import.meta.env.DEV;

function logDebug(message: string, data?: unknown): void {
  if (isDevelopment) {
    console.log(`[Worker] ${message}`, data !== undefined ? data : '');
  }
}

/**
 * Process a single word to count syllables
 */
function processWord(word: string): WordSyllables {
  try {
    // Clean the word: remove punctuation but preserve apostrophes
    const cleaned = word.replace(/[^\p{L}']/gu, '');
    
    if (!cleaned) {
      return {
        word,
        hyphenated: word,
        count: 0,
        positions: [],
        success: true,
      };
    }

    // Get hyphenated version (soft hyphens: \u00AD)
    const hyphenated = hyphenateSync(cleaned, { minWordLength: 2 }); // Or your desired minimum
    
    // Split on soft hyphens to get syllables
    const syllables = hyphenated.split('\u00AD');
    
    // Calculate positions of syllable boundaries
    const positions: number[] = [];
    let pos = 0;
    for (let i = 0; i < syllables.length - 1; i++) {
      pos += syllables[i].length;
      positions.push(pos);
    }

    // Create display version with middle dots
    const hyphenatedDisplay = syllables.join('·');

    return {
      word,
      hyphenated: hyphenatedDisplay,
      count: syllables.length,
      positions,
      success: true,
    };
  } catch (error) {
    return {
      word,
      hyphenated: word,
      count: 0,
      positions: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process an entire line of text
 * EXPORTED for main-thread fallback support
 */
export function processLine(text: string): SyllableData {
  // Split line into words (preserve whitespace info for positioning)
  const wordRegex = /\S+/g;
  const matches = Array.from(text.matchAll(wordRegex));
  
  const words: WordSyllables[] = matches.map(match => processWord(match[0]));
  
  const totalSyllables = words.reduce((sum, w) => sum + w.count, 0);
  const errors = words
    .filter(w => !w.success && w.error)
    .map(w => `"${w.word}": ${w.error}`);

  return {
    totalSyllables,
    words,
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Handle messages from the main thread
 */
self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  logDebug('Received request', { id: request.id, type: request.type, lineNumber: request.lineNumber });

  try {
    if (request.type === 'process-line') {
      const data = processLine(request.text);
      logDebug('Processed line', { id: request.id, totalSyllables: data.totalSyllables });
      
      const response: WorkerResponse = {
        id: request.id,
        type: 'line-result',
        lineNumber: request.lineNumber,
        data,
      };
      
      self.postMessage(response);
    }
  } catch (error) {
    const response: WorkerResponse = {
      id: request.id,
      type: 'error',
      lineNumber: request.lineNumber,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    
    self.postMessage(response);
  }
};

logDebug('Syllable processor worker loaded');

