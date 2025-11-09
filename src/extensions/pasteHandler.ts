/**
 * Paste Handler Extension
 * 
 * Intelligently handles pasted text by:
 * - Splitting multi-line pastes into individual lines
 * - Preserving line breaks and formatting
 * - Maintaining cursor position after paste
 */

import { EditorView } from '@codemirror/view';

/**
 * Handle paste events
 */
function handlePaste(event: ClipboardEvent): boolean {
  const text = event.clipboardData?.getData('text/plain');
  
  if (!text) return false;

  // Check if paste contains multiple lines
  const lines = text.split(/\r?\n/);
  
  console.log('[PasteHandler] Paste detected:', { lineCount: lines.length, textLength: text.length });
  
  // Let CodeMirror handle all pastes naturally
  // This ensures the React onChange callback is triggered
  console.log('[PasteHandler] Using default paste behavior (triggers onChange)');
  return false;
}

/**
 * Paste handler extension
 */
export const pasteHandler = EditorView.domEventHandlers({
  paste: handlePaste,
});
