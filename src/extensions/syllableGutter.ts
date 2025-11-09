/**
 * Syllable Gutter Extension
 * 
 * Custom CodeMirror gutter that displays syllable counts for each line.
 * Integrates with the syllable state to show real-time syllable counts.
 */

import { gutter, GutterMarker } from '@codemirror/view';
import { type EditorState } from '@codemirror/state';
import { syllableStateField, updateSyllableEffect } from './syllableState';
import type { SyllableData } from '../types';

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
 * Re-export helpers from syllableState for backward compatibility
 */
export { updateLineSyllables } from './syllableState';

/**
 * Helper to get syllable state from editor
 */
export function getSyllableState(state: EditorState) {
  return state.field(syllableStateField, false) ?? null;
}
