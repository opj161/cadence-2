/**
 * LyricEditor Component
 * 
 * Main editor component that integrates CodeMirror with all custom extensions
 * for real-time syllable counting and lyric formatting.
 * 
 * ARCHITECTURAL NOTE: This is now an UNCONTROLLED component.
 * CodeMirror's EditorState is the single source of truth for document content.
 * React subscribes to changes via the syllableProcessingPlugin, not the other way around.
 */

import { useEffect, useRef, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import type { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

// Import extensions
import { syllableGutter } from '../extensions/syllableGutter';
import { syllableStateField } from '../extensions/syllableState';
import { syllableDecorationsField } from '../extensions/syllableDecorations';
import { smartFormatting } from '../extensions/smartFormatting';
import { pasteHandler } from '../extensions/pasteHandler';
import { editorTheme, fontSizeCompartment } from '../extensions/editorTheme';
import { syllableProcessingPlugin } from '../extensions/syllableProcessing';

// Import utilities
import { logDebug } from '../utils/logger';

// Import types
import type { LyricEditorProps } from '../types';

export function LyricEditor({
  initialValue = '',
  onSyllableUpdate,
  syllablesVisible = true,
  fontSize = 16,
  isDarkMode = true,
  className = '',
}: LyricEditorProps) {
  const viewRef = useRef<EditorView | null>(null);

  // Memoize the extensions array to prevent re-creation on every render.
  // The onSyllableUpdate callback is now passed into the plugin.
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
      // NEW: Processing plugin handles all async logic
      syllableProcessingPlugin({ onSyllableUpdate }),
    ];

    if (syllablesVisible) {
      initialExtensions.push(syllableDecorationsField);
    }

    return initialExtensions;
  }, [syllablesVisible, onSyllableUpdate]);

  /**
   * Handle external changes to initialValue prop
   * This allows parent components to programmatically change the editor content
   */
  useEffect(() => {
    const view = viewRef.current;
    if (view && initialValue !== view.state.doc.toString()) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: initialValue,
        },
      });
    }
  }, [initialValue]);

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
    <CodeMirror
      className={className} // Apply className directly to CodeMirror
      value={initialValue} // This now only sets the *initial* content
      height="100%"
      theme={isDarkMode ? 'dark' : 'light'}
      extensions={extensions}
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
  );
}
