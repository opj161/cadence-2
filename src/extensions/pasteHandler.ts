/**
 * Paste Handler Extension
 * 
 * Intelligently handles pasted text with smart formatting:
 * - Cleans up multiple blank lines
 * - Trims trailing whitespace
 * - Preserves intentional formatting
 */

import { EditorView } from '@codemirror/view';

/**
 * Clean and format pasted text
 */
function cleanPastedText(text: string): string {
  // Split into lines
  let lines = text.split(/\r?\n/);
  
  // Trim trailing whitespace from each line but preserve leading spaces
  lines = lines.map(line => line.trimEnd());
  
  // Remove excessive blank lines (more than 2 consecutive)
  const cleaned: string[] = [];
  let consecutiveBlankLines = 0;
  
  for (const line of lines) {
    if (line.trim() === '') {
      consecutiveBlankLines++;
      // Only allow up to 2 blank lines in a row
      if (consecutiveBlankLines <= 2) {
        cleaned.push(line);
      }
    } else {
      consecutiveBlankLines = 0;
      cleaned.push(line);
    }
  }
  
  return cleaned.join('\n');
}

/**
 * Handle paste events with smart formatting
 */
function handlePaste(event: ClipboardEvent, view: EditorView): boolean {
  const text = event.clipboardData?.getData('text/plain');
  
  if (!text) return false;

  // Clean the pasted text
  const cleanedText = cleanPastedText(text);
  
  // If text was modified, prevent default and insert cleaned version
  if (cleanedText !== text) {
    event.preventDefault();
    
    const { from, to } = view.state.selection.main;
    view.dispatch({
      changes: { from, to, insert: cleanedText },
      selection: { anchor: from + cleanedText.length }
    });
    
    return true;
  }
  
  // Otherwise let default paste behavior handle it
  return false;
}

/**
 * Paste handler extension
 */
export const pasteHandler = EditorView.domEventHandlers({
  paste: handlePaste,
});
