/**
 * Editor Theme Extension
 * 
 * Central theme extension that encapsulates all custom editor styling
 * following CodeMirror best practices.
 */

import { EditorView } from '@codemirror/view';

export const editorTheme = EditorView.theme({
  // Increase left padding for better "breathing room"
  '.cm-scroller': {
    padding: '2rem 3rem 2rem 2rem',
  },
  // Style for the hyphenated words created by the decoration extension
  '.hyphenated-word': {
    color: 'hsl(var(--color-muted) / 0.4)', // Default state: very subtle
    transition: 'color 150ms ease-in-out',
  },
  // On the active line, make the markers prominent and match the primary color
  '.cm-activeLine .hyphenated-word': {
    color: 'hsl(var(--color-primary))',
  },
}, { dark: true }); // Assuming dark is the default/base theme style
