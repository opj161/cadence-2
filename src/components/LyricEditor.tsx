/**
 * LyricEditor Component
 * 
 * Main editor component that integrates CodeMirror with all custom extensions
 * for real-time syllable counting and lyric formatting.
 */

import { useEffect, useRef, useCallback } from 'react';
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

// Import types
import type { LyricEditorProps } from '../types';

export function LyricEditor({
  value,
  onChange,
  onSyllableUpdate,
  syllablesVisible = true,
  fontSize = 16,
  className = '',
}: LyricEditorProps) {
  const viewRef = useRef<EditorView | null>(null);

  // Set up extensions
  const extensions: Extension[] = [
    editorTheme,
    fontSizeCompartment.of(EditorView.theme({
      '&': { fontSize: `${fontSize}px` }
    })),
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
   * Handle document changes
   */
  const handleChange = useCallback((value: string, viewUpdate?: import('@codemirror/view').ViewUpdate) => {
    console.log('[LyricEditor] handleChange called:', { valueLength: value.length, linesCount: value.split('\n').length });
    
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
          // Skip empty lines
          if (line.text.trim().length > 0) {
            processLine(lineNumber, line.text);
          }
        }
      });
    }
  }, [onChange, processLine]);

  /**
   * Process all lines on initial mount
   */
  useEffect(() => {
    if (!viewRef.current) return;

    const { state } = viewRef.current;
    const doc = state.doc;

    console.log('[LyricEditor] Processing all lines on mount:', { totalLines: doc.lines });

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
   * Update font size dynamically using compartment
   */
  useEffect(() => {
    if (viewRef.current) {
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
