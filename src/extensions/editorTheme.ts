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
    padding: '2rem 3rem 2rem 2rem',
  },
  
  // Syllable marker styling - visible but not distracting
  '.syllable-marker': {
    color: 'hsl(var(--color-primary) / 0.5)',
    fontWeight: '500',
    margin: '0 0.5px',
    userSelect: 'none',
    pointerEvents: 'none',
    fontSize: '0.9em',
    transition: 'color 150ms ease-in-out',
  },
  
  // Style for words with syllable markers
  '.hyphenated-word': {
    letterSpacing: '0.02em', // Slightly more spacing for readability
  },
  
  // On the active line, make markers more prominent
  '.cm-activeLine .syllable-marker': {
    color: 'hsl(var(--color-primary))',
    fontWeight: '600',
  },
  
  // Section headers - make them stand out more
  '.cm-section-header': {
    fontWeight: '700',
    color: 'hsl(var(--color-accent))',
    background: 'hsl(var(--color-accent) / 0.15)',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    marginLeft: '-0.5rem',
    borderLeft: '3px solid hsl(var(--color-accent))',
    borderRadius: '0 0.25rem 0.25rem 0',
  },
  
  // Comment lines - more subtle
  '.cm-comment-line': {
    color: 'hsl(var(--color-muted) / 0.7)',
    fontStyle: 'italic',
  },
  
  // Improve gutter appearance
  '.cm-syllable-gutter': {
    minWidth: '3rem',
    paddingLeft: '0.5rem',
    paddingRight: '0.75rem',
  },
}, { dark: true });
