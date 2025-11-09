/**
 * Editor Theme Extension
 * 
 * Central theme extension that encapsulates all custom editor styling
 * following CodeMirror best practices.
 */

import { EditorView } from '@codemirror/view';

export const editorTheme = EditorView.theme({
  // Better padding for content area
  '.cm-scroller': {
    padding: '2rem 3rem 2rem 1.5rem', // Slightly adjust left padding for better balance
  },
  
  // The new, correct way to style hyphenated words - subtle by default
  '.hyphenated-word': {
    color: 'hsl(var(--color-muted) / 0.6)', // Subtle by default
    transition: 'color 150ms ease-in-out',
  },
  
  // On the active line, make the hyphenated words more prominent
  '.cm-activeLine .hyphenated-word': {
    color: 'hsl(var(--color-primary))',
  },
  
  // Refined Section Header style
  '.cm-section-header': {
    fontWeight: '700',
    color: 'hsl(var(--color-accent))',
    background: 'hsl(var(--color-accent) / 0.1)',
    padding: '0.2rem 0.75rem',
    borderRadius: 'var(--radius-base)',
    display: 'inline-block', // Better than line decoration
  },
  
  // Refined Comment Line style
  '.cm-comment-line': {
    color: 'hsl(var(--color-muted) / 0.6)',
    fontStyle: 'italic',
    position: 'relative', // for pseudo-elements if needed
  },
  
  // Improve gutter appearance
  '.cm-syllable-gutter': {
    minWidth: '3rem',
    paddingLeft: '0.5rem',
    paddingRight: '0.75rem',
  },
}, { dark: true });
