/**
 * Syllable Decorations Extension
 * 
 * Displays inline syllable breaks (·) within words by replacing them
 * with hyphenated versions (e.g., "beautiful" → "beau·ti·ful").
 * Integrates with syllable state to show visual syllable boundaries.
 */

import { Decoration, type DecorationSet, EditorView, WidgetType } from '@codemirror/view';
import { StateField, RangeSetBuilder } from '@codemirror/state';
import { syllableStateField, updateSyllableEffect } from './syllableGutter';
import type { SyllableData } from '../types';

/**
 * Widget for displaying hyphenated words
 */
class HyphenatedWordWidget extends WidgetType {
  hyphenated: string;
  
  constructor(hyphenated: string) {
    super();
    this.hyphenated = hyphenated;
  }

  toDOM(): HTMLElement {
    const span = document.createElement('span');
    span.className = 'hyphenated-word';
    span.textContent = this.hyphenated;
    return span;
  }

  eq(other: HyphenatedWordWidget): boolean {
    return this.hyphenated === other.hyphenated;
  }

  ignoreEvent(): boolean {
    return false; // Allow normal editing
  }

  get estimatedHeight(): number {
    return -1; // Use default height
  }
}

/**
 * Create decorations for hyphenated words on a line
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
  
  // Find each word and replace with hyphenated version
  const wordRegex = /\S+/g;
  const matches = Array.from(lineText.matchAll(wordRegex));
  
  for (let i = 0; i < matches.length && i < data.words.length; i++) {
    const match = matches[i];
    const wordData = data.words[i];
    
    // Only replace words that were successfully hyphenated and have syllable breaks
    if (!wordData.success || wordData.count <= 1) continue;
    
    // Calculate absolute positions
    const wordStart = line.from + match.index!;
    const wordEnd = wordStart + match[0].length;
    
    // Create replacement decoration with hyphenated word
    const decoration = Decoration.replace({
      widget: new HyphenatedWordWidget(wordData.hyphenated),
    });
    
    decorations.push({ from: wordStart, to: wordEnd, decoration });
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
