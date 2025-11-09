/**
 * Smart Formatting Extension
 * 
 * Applies visual styling to special elements in lyrics:
 * - Section headers: [Verse], [Chorus], [Bridge], etc.
 * - Chords: Text in square brackets on separate lines
 * - Comments: Lines starting with #
 */

import { Decoration, type DecorationSet, EditorView } from '@codemirror/view';
import { type Range } from '@codemirror/state';
import { ViewPlugin } from '@codemirror/view';

// Regex patterns for detection
const SECTION_HEADER_REGEX = /^\s*\[(Verse|Chorus|Bridge|Pre-Chorus|Intro|Outro|Hook|Refrain)(?:\s+\d+)?\]\s*$/i;
const CHORD_LINE_REGEX = /^\s*\[[\w\d#b/\s]+\]\s*$/;
const COMMENT_REGEX = /^#.*/;

/**
 * View plugin that manages smart formatting decorations
 */
const smartFormattingPlugin = ViewPlugin.fromClass(class {
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = this.buildDecorations(view);
  }

  update(update: import('@codemirror/view').ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view);
    }
  }

  buildDecorations(view: EditorView): DecorationSet {
    const decorations: Range<Decoration>[] = [];
    
    // Get the current cursor position
    const cursorLine = view.state.doc.lineAt(view.state.selection.main.head).number;

    // Process visible lines
    for (const { from, to } of view.visibleRanges) {
      const fromLine = view.state.doc.lineAt(from);
      const toLine = view.state.doc.lineAt(to);

      for (let lineNum = fromLine.number; lineNum <= toLine.number; lineNum++) {
        const line = view.state.doc.line(lineNum);
        const lineText = line.text;
        
        // Skip formatting the line where the cursor currently is
        // This allows typing [] without it being instantly formatted/deleted
        if (lineNum === cursorLine) {
          continue;
        }

        // Check for section header
        if (SECTION_HEADER_REGEX.test(lineText)) {
          decorations.push(
            Decoration.line({ class: 'cm-section-header' }).range(line.from)
          );
        }
        // Check for chord line
        else if (CHORD_LINE_REGEX.test(lineText)) {
          decorations.push(
            Decoration.line({ class: 'cm-chord-line' }).range(line.from)
          );
        }
        // Check for comment
        else if (COMMENT_REGEX.test(lineText)) {
          decorations.push(
            Decoration.line({ class: 'cm-comment-line' }).range(line.from)
          );
        }
      }
    }

    return Decoration.set(decorations, true);
  }
}, {
  decorations: v => v.decorations,
});

/**
 * Extension for smart formatting
 */
export const smartFormatting = [
  smartFormattingPlugin,
];
