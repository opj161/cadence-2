/**
 * Syllable Decorations Extension
 * 
 * Displays inline syllable break markers (·) at syllable boundaries within words.
 * Uses a more efficient mark decoration approach instead of widget replacement.
 * Integrates with syllable state to show visual syllable boundaries.
 */

import { Decoration, type DecorationSet, EditorView, WidgetType } from '@codemirror/view';
import { StateField, RangeSetBuilder } from '@codemirror/state';
import { syllableStateField, updateSyllableEffect } from './syllableGutter';
import type { SyllableData } from '../types';

/**
 * Widget for displaying a syllable break marker
 */
class SyllableMarkerWidget extends WidgetType {
  constructor() {
    super();
  }

  toDOM(): HTMLElement {
    const span = document.createElement('span');
    span.className = 'syllable-marker';
    span.textContent = '·';
    span.setAttribute('aria-hidden', 'true');
    return span;
  }

  eq(other: SyllableMarkerWidget): boolean {
    return other instanceof SyllableMarkerWidget;
  }

  ignoreEvent(): boolean {
    return true; // Don't interfere with editing
  }
}

/**
 * Create decorations for syllable markers on a line
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
  
  // Find each word and add syllable markers
  const wordRegex = /\S+/g;
  const matches = Array.from(lineText.matchAll(wordRegex));
  
  for (let i = 0; i < matches.length && i < data.words.length; i++) {
    const match = matches[i];
    const wordData = data.words[i];
    
    // Only add markers for words with multiple syllables
    if (!wordData.success || wordData.count <= 1 || wordData.positions.length === 0) {
      continue;
    }
    
    // Calculate word start position in document
    const wordStart = line.from + match.index!;
    
    // Add a marker widget at each syllable boundary
    for (const position of wordData.positions) {
      const markerPos = wordStart + position;
      
      // Ensure position is within the word bounds
      if (markerPos > wordStart && markerPos < wordStart + match[0].length) {
        const decoration = Decoration.widget({
          widget: new SyllableMarkerWidget(),
          side: 0, // Place at the position (not before or after)
        });
        
        decorations.push({ from: markerPos, to: markerPos, decoration });
      }
    }
    
    // Mark the entire word with a class for styling
    const wordMark = Decoration.mark({
      class: 'hyphenated-word',
    });
    decorations.push({ from: wordStart, to: wordStart + match[0].length, decoration: wordMark });
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
