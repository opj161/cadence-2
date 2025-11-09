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
 * Helper to update syllable data for a line
 */
export function updateLineSyllables(lineNumber: number, data: SyllableData) {
  return updateSyllableEffect.of({ lineNumber, data });
}
