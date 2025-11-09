/**
 * LyricEditor Component
 * 
 * Main editor component that integrates CodeMirror with all custom extensions
 * for real-time syllable counting and lyric formatting.
 */

import { useEffect, useRef, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import type { Extension } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';

// Import extensions
import { syllableGutter, syllableStateField, updateLineSyllables } from '../extensions/syllableGutter';
import { syllableDecorationsField } from '../extensions/syllableDecorations';
import { smartFormatting } from '../extensions/smartFormatting';
import { pasteHandler } from '../extensions/pasteHandler';

// Import utilities
import { getWorkerManager } from '../utils/workerManager';

// Import types
import type { LyricEditorProps } from '../types';

export function LyricEditor({
  initialValue = '',
  onChange,
  onSyllableUpdate,
  syllablesVisible = true,
  fontSize = 16,
  className = '',
}: LyricEditorProps) {
  const viewRef = useRef<EditorView | null>(null);
  const processingTimeoutRef = useRef<number | null>(null);

  // Set up extensions
  const extensions: Extension[] = [
    syllableStateField,
    syllableGutter,
    ...(syllablesVisible ? [syllableDecorationsField] : []),
    smartFormatting,
    pasteHandler,
  ];

  /**
   * Process a line of text for syllable counting
   */
  const processLine = useCallback(async (lineNumber: number, text: string) => {
    try {
      console.log('[LyricEditor] Processing line:', { lineNumber, text, textLength: text.length });
      const workerManager = getWorkerManager();
      const data = await workerManager.processLine(text, lineNumber);
      console.log('[LyricEditor] Received syllable data:', { lineNumber, totalSyllables: data.totalSyllables, wordCount: data.words.length });

      // Update editor state with syllable data
      if (viewRef.current) {
        viewRef.current.dispatch({
          effects: updateLineSyllables(lineNumber, data),
        });
        console.log('[LyricEditor] Dispatched syllable update to editor');
      }

      // Notify parent component
      if (onSyllableUpdate) {
        onSyllableUpdate(lineNumber, data);
      }
    } catch (error) {
      console.error(`[LyricEditor] Error processing line ${lineNumber}:`, error);
    }
  }, [onSyllableUpdate]);

  /**
   * Process all visible lines in the editor
   */
  const processVisibleLines = useCallback(() => {
    if (!viewRef.current) {
      console.warn('[LyricEditor] processVisibleLines called but viewRef is null');
      return;
    }

    const { state } = viewRef.current;
    const doc = state.doc;

    console.log('[LyricEditor] Processing visible lines:', { totalLines: doc.lines });

    // Process each line
    for (let i = 1; i <= doc.lines; i++) {
      const line = doc.line(i);
      const lineNumber = i - 1; // Convert to 0-based
      const text = line.text;

      // Skip empty lines
      if (text.trim().length === 0) {
        console.log(`[LyricEditor] Skipping empty line ${lineNumber}`);
        continue;
      }

      processLine(lineNumber, text);
    }
  }, [processLine]);

  /**
   * Handle document changes
   */
  const handleChange = useCallback((value: string) => {
    console.log('[LyricEditor] handleChange called:', { valueLength: value.length, linesCount: value.split('\n').length });
    
    // Call parent onChange
    if (onChange) {
      onChange(value);
    }

    // Debounce processing
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    processingTimeoutRef.current = window.setTimeout(() => {
      console.log('[LyricEditor] Debounce timeout complete, calling processVisibleLines');
      processVisibleLines();
    }, 300); // 300ms debounce
  }, [onChange, processVisibleLines]);

  /**
   * Process lines on initial mount
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      processVisibleLines();
    }, 100);

    return () => clearTimeout(timer);
  }, [processVisibleLines]);

  /**
   * Clean up processing timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`lyric-editor-container ${className}`} style={{ fontSize: `${fontSize}px` }}>
      <CodeMirror
        value={initialValue}
        height="100%"
        extensions={extensions}
        onChange={handleChange}
        basicSetup={{
          lineNumbers: true,
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
