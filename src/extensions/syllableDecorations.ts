/**
 * Syllable Decorations Extension
 * 
 * Displays inline syllable breaks by replacing words with their hyphenated versions.
 * Uses Decoration.replace to swap entire words while preserving text flow and selectability.
 */

import { Decoration, type DecorationSet, EditorView, WidgetType } from '@codemirror/view';
import { StateField, RangeSetBuilder } from '@codemirror/state';
import { syllableStateField, updateSyllableEffect } from './syllableState';
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
): Array<{ from: number; to: number; decoration: Decoration }> {
  const decorations: Array<{ from: number; to: number; decoration: Decoration }> = [];
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

      decorations.push({ from, to, decoration });
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
    // Map existing decorations through document changes
    decorations = decorations.map(transaction.changes);

    // Check if syllable data was updated
    const syllableUpdates = transaction.effects.filter(e => e.is(updateSyllableEffect));
    
    if (syllableUpdates.length > 0) {
      const syllableState = transaction.state.field(syllableStateField, false);
      if (!syllableState) return decorations;

      // Build new decoration set
      const builder = new RangeSetBuilder<Decoration>();
      
      // Collect all decorations from all lines
      const allDecorations: Array<{ from: number; to: number; decoration: Decoration }> = [];
      
      // Process each line that has syllable data
      syllableState.lines.forEach((data, lineNum) => {
        const lineDecorations = createLineDecorations(
          { state: transaction.state } as EditorView,
          lineNum,
          data
        );
        allDecorations.push(...lineDecorations);
      });
      
      // Sort by position and add to builder
      allDecorations.sort((a, b) => a.from - b.from);
      for (const { from, to, decoration } of allDecorations) {
        builder.add(from, to, decoration);
      }

      decorations = builder.finish();
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
