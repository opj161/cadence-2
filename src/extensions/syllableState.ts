/**
 * Syllable State Extension
 * 
 * Centralized state management for syllable data across all extensions.
 * This state field is shared by both the gutter and decorations extensions.
 */

import { StateField, StateEffect } from '@codemirror/state';
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
    let newLines = state.lines;
    let updated = false;

    // Process syllable update effects
    for (const effect of transaction.effects) {
      if (effect.is(updateSyllableEffect)) {
        const { lineNumber, data } = effect.value;
        // Only create new Map if this is the first update in this transaction
        if (!updated) {
          newLines = new Map(state.lines);
          updated = true;
        }
        newLines.set(lineNumber, data);
      }
    }

    // Clear syllable data for deleted lines
    if (transaction.docChanged) {
      const doc = transaction.newDoc;
      const linesToRemove: number[] = [];
      
      // Identify lines that no longer exist
      newLines.forEach((_, lineNum) => {
        if (lineNum >= doc.lines) {
          linesToRemove.push(lineNum);
        }
      });

      // Only create new Map if we need to remove lines
      if (linesToRemove.length > 0) {
        if (!updated) {
          newLines = new Map(state.lines);
          updated = true;
        }
        linesToRemove.forEach(lineNum => newLines.delete(lineNum));
      }
    }

    // Only create new state object if something changed
    return updated ? {
      lines: newLines,
      lastUpdate: Date.now(),
    } : state;
  },
});

/**
 * Helper to update syllable data for a line
 */
export function updateLineSyllables(lineNumber: number, data: SyllableData) {
  return updateSyllableEffect.of({ lineNumber, data });
}
