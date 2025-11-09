/**
 * Editor Theme Extension
 * 
 * Central theme extension that encapsulates all custom editor styling
 * following CodeMirror best practices.
 */

import { EditorView } from '@codemirror/view';
import { Compartment } from '@codemirror/state';

/**
 * Compartment for dynamically reconfigurable font size
 */
export const fontSizeCompartment = new Compartment();

export const editorTheme = EditorView.theme({
  // Editor container
  '&': {
    height: '100%',
    fontFamily: 'var(--font-lyric)',
    fontSize: '17px',
    lineHeight: '1.7',
    fontWeight: '400',
    letterSpacing: '-0.01em',
    background: 'hsl(var(--color-editor-bg))',
    border: 'none',
    borderRadius: '0',
  },
  
  // Focus state
  '&.cm-focused': {
    outline: 'none',
    boxShadow: 'inset 0 0 0 2px hsl(var(--color-primary) / 0.5)',
  },
  
  // Scroller
  '.cm-scroller': {
    padding: '2rem 3rem 2rem 1.5rem',
    overflow: 'auto',
    fontFamily: 'inherit',
  },
  
  // Content
  '.cm-content': {
    color: 'hsl(var(--color-foreground))',
  },
  
  // Lines
  '.cm-line': {
    color: 'hsl(var(--color-foreground))',
    padding: '0.125rem 0',
  },
  
  // Gutters
  '.cm-gutters': {
    background: 'hsl(var(--color-gutter-bg))',
    borderRight: '1px solid hsl(var(--color-border))',
    padding: '0 1.25rem 0 1rem',
    minWidth: 'fit-content',
  },
  
  // Active line
  '.cm-activeLine': {
    background: 'hsl(var(--color-active-line)) !important',
  },
  
  '.cm-activeLineGutter': {
    background: 'hsl(var(--color-active-line)) !important',
  },
  
  // Selection
  '.cm-selectionBackground': {
    background: 'hsl(var(--color-primary) / 0.25) !important',
  },
  
  '&.cm-focused .cm-selectionBackground': {
    background: 'hsl(var(--color-primary) / 0.3) !important',
  },
  
  '.cm-selectionMatch': {
    background: 'hsl(var(--color-primary) / 0.2) !important',
  },
  
  // Cursor
  '.cm-cursor': {
    borderLeft: '2.5px solid hsl(var(--color-primary))',
    borderLeftWidth: '2.5px',
  },
  
  // Gutter elements (line numbers)
  '.cm-gutterElement': {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'hsl(var(--color-muted) / 0.4)',
    fontVariantNumeric: 'tabular-nums',
    fontFamily: 'var(--font-mono)',
    padding: '0 0.75rem 0 0',
    minWidth: '2.5rem',
    textAlign: 'right',
  },
  
  '.cm-activeLineGutter .cm-gutterElement': {
    color: 'hsl(var(--color-primary))',
    fontWeight: '700',
  },
  
  // Syllable gutter
  '.cm-syllable-gutter': {
    minWidth: '3rem',
    paddingLeft: '0.5rem',
    paddingRight: '0.75rem',
  },
  
  // Hyphenated words - subtle by default
  '.hyphenated-word': {
    color: 'hsl(var(--color-muted) / 0.4)', // Very subtle by default
    transition: 'color 150ms ease-in-out',
  },
  
  // On the active line, make the hyphenated words more prominent
  '.cm-activeLine .hyphenated-word': {
    color: 'hsl(var(--color-primary))',
  },
  
  // Section Header style
  '.cm-section-header': {
    fontWeight: '700',
    color: 'hsl(var(--color-accent))',
    background: 'hsl(var(--color-accent) / 0.1)',
    padding: '0.2rem 0.75rem',
    borderRadius: 'var(--radius-base)',
    display: 'inline-block',
  },
  
  // Comment Line style
  '.cm-comment-line': {
    color: 'hsl(var(--color-muted) / 0.6)',
    fontStyle: 'italic',
    position: 'relative',
  },
}, { dark: true });
