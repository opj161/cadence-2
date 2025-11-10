/**
 * Syllable Processing Plugin
 * 
 * ViewPlugin that manages the entire async processing pipeline.
 * Handles debouncing, viewport-aware processing, and worker communication.
 */

import { ViewPlugin, type ViewUpdate } from '@codemirror/view';
import { getWorkerManager } from '../utils/workerManager';
import { updateLineSyllables } from './syllableState';
import { logger } from '../utils/logger';
import { debounce } from '../utils/debounce';
import type { SyllableData } from '../types';

interface SyllablePluginConfig {
  onSyllableUpdate?: (lineNumber: number, data: SyllableData) => void;
  delay?: number;
}

/**
 * Plugin that manages syllable processing for the editor
 * This decouples React from CodeMirror's state management
 */
export const syllableProcessingPlugin = (config: SyllablePluginConfig = {}) => {
  const { onSyllableUpdate, delay = 300 } = config;

  return ViewPlugin.fromClass(class {
    private idleCallbackId: number | null = null;
    private isDestroyed = false;
    private debouncedProcessVisible: ReturnType<typeof debounce>;

    constructor(view: import('@codemirror/view').EditorView) {
      // Initialize the debounced function in the constructor
      // We must bind `this` so the method has the correct context when called
      this.debouncedProcessVisible = debounce(
        (v: import('@codemirror/view').EditorView) => this.processVisible(v),
        delay
      );
      
      // Defer initial processing to allow the editor to render first
      this.processInitialView(view);
    }

    update(update: ViewUpdate) {
      // Guard against updates after destruction
      if (this.isDestroyed) return;
      
      if (update.docChanged || update.viewportChanged) {
        // Simply call the debounced function
        this.debouncedProcessVisible(update.view);
      }
    }
    
    destroy() {
      // Set flag to prevent async operations from proceeding
      this.isDestroyed = true;
      
      // Cancel any pending debounced calls
      this.debouncedProcessVisible.cancel();
      
      if (this.idleCallbackId !== null) {
        const cancel = window.cancelIdleCallback || clearTimeout;
        cancel(this.idleCallbackId);
        this.idleCallbackId = null;
      }
    }

    /**
     * Initial load processing - prioritize visible content
     */
    processInitialView(view: import('@codemirror/view').EditorView) {
      // 1. Process visible lines immediately
      setTimeout(() => {
        if (!this.isDestroyed) {
          this.processVisible(view);
          // 2. Schedule the rest of the document during idle time
          this.scheduleIdleProcessing(view);
        }
      }, 50);
    }

    /**
     * Process only what's currently visible in the viewport
     */
    processVisible(view: import('@codemirror/view').EditorView) {
      if (this.isDestroyed) return;
      
      for (const { from, to } of view.visibleRanges) {
        for (let pos = from; pos <= to; ) {
          const line = view.state.doc.lineAt(pos);
          this.processLine(view, line.number - 1, line.text);
          pos = line.to + 1;
        }
      }
    }
    
    /**
     * Schedule processing of non-visible content during idle time
     */
    scheduleIdleProcessing(view: import('@codemirror/view').EditorView) {
      const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 500));
      
      this.idleCallbackId = schedule(() => {
        // Check before starting idle work
        if (this.isDestroyed) return;
        
        // Build set of already-processed visible lines
        const processedLines = new Set<number>();
        for (const { from, to } of view.visibleRanges) {
          let pos = from;
          while (pos <= to) {
            const line = view.state.doc.lineAt(pos);
            processedLines.add(line.number);
            pos = line.to + 1;
          }
        }

        // Process all other lines in the background
        for (let i = 1; i <= view.state.doc.lines; i++) {
          if (this.isDestroyed) break; // Stop if destroyed during processing
          if (!processedLines.has(i)) {
            const line = view.state.doc.line(i);
            this.processLine(view, line.number - 1, line.text);
          }
        }
      });
    }

    /**
     * Process a single line of text
     */
    async processLine(
      view: import('@codemirror/view').EditorView,
      lineNumber: number,
      text: string
    ) {
      // Guard at the start of the async function
      if (this.isDestroyed) return;

      try {
        // Clear data for empty lines
        if (text.trim().length === 0) {
          view.dispatch({
            effects: updateLineSyllables(lineNumber, {
              totalSyllables: 0,
              words: [],
              success: true,
            }),
          });
          return;
        }

        const workerManager = getWorkerManager();
        const data = await workerManager.processLine(text, lineNumber);

        // CRITICAL: Check again after the await. The plugin could have been
        // destroyed while the worker was processing.
        if (this.isDestroyed) return;

        // Verify the line hasn't changed while we were processing
        if (lineNumber + 1 <= view.state.doc.lines) {
          const currentLine = view.state.doc.line(lineNumber + 1);
          if (currentLine.text === text) {
            view.dispatch({
              effects: updateLineSyllables(lineNumber, data),
            });

            // Notify parent component if callback provided
            if (onSyllableUpdate) {
              onSyllableUpdate(lineNumber, data);
            }
          }
        }
      } catch (error) {
        // Check before logging error on a destroyed instance
        if (!this.isDestroyed) {
          // Ignore 'Request superseded' errors - they're expected during rapid typing
          if (error instanceof Error && error.message !== 'Request superseded') {
            logger.error('SyllablePlugin', `Error processing line ${lineNumber}`, error);
          }
        }
      }
    }
  });
};
