/**
 * Syllable Decorations Extension
 * 
 * Displays inline syllable breaks by replacing words with their hyphenated versions.
 * Uses Decoration.replace to swap entire words while preserving text flow and selectability.
 */

import { Decoration, type DecorationSet, EditorView, WidgetType } from '@codemirror/view';
import { StateField, type Range } from '@codemirror/state';
import { updateSyllableEffect } from './syllableState';
import type { SyllableData } from '../types';

/**
 * Widget that displays a word with inline syllable markers.
 * Replaces the original word entirely to maintain proper text flow.
 */
class HyphenatedWordWidget extends WidgetType {
  display: string;

  constructor(display: string) {
    super();
    this.display = display;
  }

  toDOM(): HTMLElement {
    const span = document.createElement('span');
    span.className = 'hyphenated-word';
    span.textContent = this.display;
    return span;
  }

  eq(other: HyphenatedWordWidget): boolean {
    return other instanceof HyphenatedWordWidget && this.display === other.display;
  }

  ignoreEvent(): boolean {
    return false; // Allow interaction with the text
  }
}

/**
 * Create decorations for a single line by replacing words with their hyphenated versions.
 */
function createLineDecorations(
  view: EditorView,
  lineNumber: number,
  data: SyllableData
): Range<Decoration>[] {
  const decorations: Range<Decoration>[] = [];
  const doc = view.state.doc;
  
  // Get the line (CodeMirror uses 1-based line numbers)
  if (lineNumber + 1 > doc.lines) return decorations;
  
  const line = doc.line(lineNumber + 1);
  const lineText = line.text;
  
  // Find each word in the line
  const wordRegex = /\S+/g;
  let match;
  let wordIndex = 0;

  // Iterate over words found in the line text
  while ((match = wordRegex.exec(lineText)) !== null && wordIndex < data.words.length) {
    const wordData = data.words[wordIndex];
    wordIndex++;

    // Only replace words with more than one syllable that were processed successfully
    if (wordData.success && wordData.count > 1) {
      const from = line.from + match.index;
      const to = from + match[0].length;
      
      const decoration = Decoration.replace({
        widget: new HyphenatedWordWidget(wordData.hyphenated),
      });

      decorations.push(decoration.range(from, to));
    }
  }
  
  return decorations;
}

/**
 * State field for syllable decorations
 */
export const syllableDecorationsField = StateField.define<DecorationSet>({
  create(): DecorationSet {
    return Decoration.none;
  },

  update(decorations, transaction): DecorationSet {
    // Map existing decorations through any document changes.
    decorations = decorations.map(transaction.changes);
    
    // Check for our specific effect.
    for (const effect of transaction.effects) {
      if (effect.is(updateSyllableEffect)) {
        const { lineNumber, data } = effect.value;
        const doc = transaction.state.doc;
        
        // Ensure the line still exists
        if (lineNumber + 1 > doc.lines) continue;

        // Create decorations for the single updated line.
        const newDecorationsForLine = createLineDecorations(
          { state: transaction.state } as EditorView,
          lineNumber,
          data
        );
        
        // ✅ OPTIMIZED: Use RangeSet.between() for targeted replacement
        // This avoids iterating over all decorations in the document.
        // O(log N + M) instead of O(N), where M is decorations on the changed line.
        const newDecorations: Range<Decoration>[] = [];
        
        // Add all decorations that are NOT on the updated line
        decorations.between(0, doc.length, (from, to, deco) => {
          const decoLine = doc.lineAt(from);
          if (decoLine.number - 1 !== lineNumber) {
            newDecorations.push(deco.range(from, to));
          }
        });
        
        // Add the new decorations for the updated line
        newDecorations.push(...newDecorationsForLine);
        
        // Rebuild the set (sorting is important for performance)
        decorations = Decoration.set(newDecorations, true);
      }
    }
    return decorations;
  },

  provide: f => EditorView.decorations.from(f),
});

/**
 * Extension array for syllable decorations
 */
export const syllableDecorations = [
  syllableDecorationsField,
];
