/**
 * Syllable Gutter Extension
 * 
 * Custom CodeMirror gutter that displays syllable counts for each line.
 * Integrates with the syllable state to show real-time syllable counts.
 */

import { gutter, GutterMarker } from '@codemirror/view';
import { StateField, StateEffect, type EditorState } from '@codemirror/state';
import type { SyllableData, SyllableState, SyllableUpdateEffect } from '../types';

/**
 * Effect for updating syllable data for a specific line
 */
export const updateSyllableEffect = StateEffect.define<SyllableUpdateEffect>();

/**
 * State field that stores syllable data for all lines
 */
export const syllableStateField = StateField.define<SyllableState>({
  create(): SyllableState {
    return {
      lines: new Map(),
      lastUpdate: Date.now(),
    };
  },

  update(state, transaction): SyllableState {
    let newState = state;

    // Process syllable update effects
    for (const effect of transaction.effects) {
      if (effect.is(updateSyllableEffect)) {
        const { lineNumber, data } = effect.value;
        const newLines = new Map(newState.lines);
        newLines.set(lineNumber, data);
        
        newState = {
          lines: newLines,
          lastUpdate: Date.now(),
        };
      }
    }

    // Clear syllable data for deleted lines
    if (transaction.docChanged) {
      const newLines = new Map<number, SyllableData>();
      const doc = transaction.newDoc;
      
      // Only keep syllable data for lines that still exist
      newState.lines.forEach((data, lineNum) => {
        if (lineNum < doc.lines) {
          newLines.set(lineNum, data);
        }
      });

      if (newLines.size !== newState.lines.size) {
        newState = {
          lines: newLines,
          lastUpdate: Date.now(),
        };
      }
    }

    return newState;
  },
});

/**
 * Gutter marker for displaying syllable counts
 */
class SyllableGutterMarker extends GutterMarker {
  count: number;
  hasErrors: boolean;

  constructor(count: number, hasErrors: boolean) {
    super();
    this.count = count;
    this.hasErrors = hasErrors;
  }

  toDOM(): HTMLElement {
    const dom = document.createElement('div');
    dom.className = `syllable-count${this.hasErrors ? ' has-errors' : ''}`;
    dom.textContent = this.count.toString();
    dom.title = this.hasErrors 
      ? `${this.count} syllables (some words failed to process)` 
      : `${this.count} syllables`;
    return dom;
  }
}

/**
 * Get syllable data for a specific line
 */
function getSyllableData(state: EditorState, lineNumber: number): SyllableData | null {
  const syllableState = state.field(syllableStateField, false);
  if (!syllableState) return null;
  return syllableState.lines.get(lineNumber) ?? null;
}

/**
 * Syllable gutter extension
 */
export const syllableGutter = gutter({
  class: 'cm-syllable-gutter',
  
  lineMarker(view, line) {
    const lineNumber = view.state.doc.lineAt(line.from).number - 1; // Convert to 0-based
    const data = getSyllableData(view.state, lineNumber);
    
    if (!data) return null;
    
    // Don't show marker for empty lines
    if (data.totalSyllables === 0) return null;
    
    const hasErrors = Boolean(data.errors && data.errors.length > 0);
    return new SyllableGutterMarker(data.totalSyllables, hasErrors);
  },

  lineMarkerChange(update) {
    // Re-render gutter if syllable state changed or document changed
    return update.docChanged || 
           update.transactions.some(tr => tr.effects.some(e => e.is(updateSyllableEffect)));
  },
});

/**
 * Helper to update syllable data for a line
 */
export function updateLineSyllables(lineNumber: number, data: SyllableData) {
  return updateSyllableEffect.of({ lineNumber, data });
}

/**
 * Helper to get syllable state from editor
 */
export function getSyllableState(state: EditorState): SyllableState | null {
  return state.field(syllableStateField, false) ?? null;
}
