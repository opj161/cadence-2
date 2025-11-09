/**
 * LyricEditor Component
 * 
 * Main editor component that integrates CodeMirror with all custom extensions
 * for real-time syllable counting and lyric formatting.
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import type { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

// Import extensions
import { syllableGutter } from '../extensions/syllableGutter';
import { syllableStateField, updateLineSyllables } from '../extensions/syllableState';
import { syllableDecorationsField } from '../extensions/syllableDecorations';
import { smartFormatting } from '../extensions/smartFormatting';
import { pasteHandler } from '../extensions/pasteHandler';
import { editorTheme, fontSizeCompartment } from '../extensions/editorTheme';

// Import utilities
import { getWorkerManager } from '../utils/workerManager';
import { logDebug, logError } from '../utils/logger';

// Import types
import type { LyricEditorProps } from '../types';

export function LyricEditor({
  value,
  onChange,
  onSyllableUpdate,
  syllablesVisible = true,
  fontSize = 16,
  isDarkMode = true,
  className = '',
}: LyricEditorProps) {
  const viewRef = useRef<EditorView | null>(null);
  const debounceTimeoutRef = useRef<Map<number, number>>(new Map());

  // Memoize the extensions array to prevent re-creation on every render.
  // Dependencies: ONLY syllablesVisible (changes extension set)
  // fontSize is handled via compartment reconfiguration in useEffect below
  const extensions = useMemo<Extension[]>(() => {
    logDebug('LyricEditor', 'Re-creating extensions array', { syllablesVisible });
    const initialExtensions: Extension[] = [
      editorTheme,
      fontSizeCompartment.of(EditorView.theme({
        '&': { fontSize: '16px' } // Default only - dynamic updates via compartment
      })),
      syllableStateField,
      syllableGutter,
      smartFormatting,
      pasteHandler,
    ];

    if (syllablesVisible) {
      initialExtensions.push(syllableDecorationsField);
    }

    return initialExtensions;
  }, [syllablesVisible]);

  /**
   * Process a line of text for syllable counting
   */
  const processLine = useCallback(async (lineNumber: number, text: string) => {
    try {
      logDebug('LyricEditor', `Processing line ${lineNumber}`, { textLength: text.length });
      const workerManager = getWorkerManager();
      const data = await workerManager.processLine(text, lineNumber);
      logDebug('LyricEditor', `Received syllable data for line ${lineNumber}`, data);

      // Update editor state with syllable data
      if (viewRef.current) {
        viewRef.current.dispatch({
          effects: updateLineSyllables(lineNumber, data),
        });
      }

      // Notify parent component
      if (onSyllableUpdate) {
        onSyllableUpdate(lineNumber, data);
      }
    } catch (error) {
      // Ignore 'Request superseded' errors as they are expected during debouncing
      if (error instanceof Error && error.message !== 'Request superseded') {
        logError('LyricEditor', `Error processing line ${lineNumber}:`, error);
      }
    }
  }, [onSyllableUpdate]);

  /**
   * Debounced version of processLine to avoid overwhelming the worker during rapid typing.
   */
  const debouncedProcessLine = useCallback((lineNumber: number, text: string) => {
    // Cancel any existing timeout for this line
    if (debounceTimeoutRef.current.has(lineNumber)) {
      clearTimeout(debounceTimeoutRef.current.get(lineNumber));
    }
    
    // Set new timeout
    const timeoutId = window.setTimeout(() => {
      processLine(lineNumber, text);
      debounceTimeoutRef.current.delete(lineNumber);
    }, 250); // 250ms debounce delay
    
    debounceTimeoutRef.current.set(lineNumber, timeoutId);
  }, [processLine]);

  /**
   * Handle document changes
   */
  const handleChange = useCallback((value: string, viewUpdate?: import('@codemirror/view').ViewUpdate) => {
    logDebug('LyricEditor', 'handleChange called', { valueLength: value.length });
    
    // Call parent onChange
    if (onChange) {
      onChange(value);
    }

    // Process only changed lines for efficiency
    if (viewUpdate && viewUpdate.docChanged) {
      const changedLines = new Set<number>();
      
      viewUpdate.changes.iterChanges((fromA, toA) => {
        const fromLine = viewUpdate.startState.doc.lineAt(fromA);
        const toLine = viewUpdate.startState.doc.lineAt(toA);
        for (let i = fromLine.number; i <= toLine.number; i++) {
          changedLines.add(i - 1); // Convert to 0-based
        }
      });

      const { state } = viewUpdate;
      changedLines.forEach(lineNumber => {
        if (lineNumber + 1 <= state.doc.lines) {
          const line = state.doc.line(lineNumber + 1);
          // Use debounced processing to avoid overwhelming the worker during rapid typing
          debouncedProcessLine(lineNumber, line.text);
        }
      });
    }
  }, [onChange, debouncedProcessLine]);

  /**
   * Process all lines on initial mount
   */
  useEffect(() => {
    if (!viewRef.current) return;

    const { state } = viewRef.current;
    const doc = state.doc;

    logDebug('LyricEditor', 'Processing all lines on mount', { totalLines: doc.lines });

    // Process each line
    for (let i = 1; i <= doc.lines; i++) {
      const line = doc.line(i);
      const lineNumber = i - 1; // Convert to 0-based
      const text = line.text;

      // Skip empty lines
      if (text.trim().length === 0) {
        continue;
      }

      processLine(lineNumber, text);
    }
  }, [processLine]);

  /**
   * Update font size dynamically using compartment
   */
  useEffect(() => {
    if (viewRef.current) {
      logDebug('LyricEditor', `Reconfiguring font size to ${fontSize}px`);
      viewRef.current.dispatch({
        effects: fontSizeCompartment.reconfigure(EditorView.theme({
          '&': { fontSize: `${fontSize}px` }
        }))
      });
    }
  }, [fontSize]);

  return (
    <div className={`lyric-editor-container ${className}`}>
      <CodeMirror
        value={value}
        height="100%"
        theme={isDarkMode ? 'dark' : 'light'}
        extensions={extensions}
        onChange={handleChange}
        basicSetup={{
          lineNumbers: false,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: false,
          dropCursor: true,
          indentOnInput: false,
          bracketMatching: false,
          closeBrackets: false,
          autocompletion: false,
          rectangularSelection: true,
          crosshairCursor: false,
          highlightSelectionMatches: false,
          closeBracketsKeymap: false,
          searchKeymap: true,
          foldKeymap: false,
          completionKeymap: false,
          lintKeymap: false,
        }}
        onCreateEditor={(view) => {
          viewRef.current = view;
        }}
      />
    </div>
  );
}
