/**
 * Worker Manager
 * 
 * Manages communication with the syllable processor Web Worker.
 * Provides a promise-based API for processing text lines.
 */

import type { WorkerRequest, WorkerResponse, SyllableData } from '../types';

export class WorkerManager {
  private worker: Worker;
  private requestId: number = 0;
  private pendingRequests: Map<number, {
    resolve: (data: SyllableData) => void;
    reject: (error: Error) => void;
  }> = new Map();

  constructor() {
    console.log('[WorkerManager] Initializing Web Worker...');
    // Create the Web Worker using Vite's special syntax
    this.worker = new Worker(
      new URL('../workers/syllableProcessor.worker.ts', import.meta.url),
      { type: 'module' }
    );
    console.log('[WorkerManager] Worker created successfully');

    // Set up message handler
    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      this.handleResponse(event.data);
    };

    // Set up error handler
    this.worker.onerror = (error) => {
      console.error('[WorkerManager] Worker error:', error);
      // Reject all pending requests
      this.pendingRequests.forEach(({ reject }) => {
        reject(new Error('Worker encountered an error'));
      });
      this.pendingRequests.clear();
    };
  }

  /**
   * Process a line of text and return syllable data
   */
  processLine(text: string, lineNumber: number): Promise<SyllableData> {
    return new Promise((resolve, reject) => {
      const id = this.requestId++;
      console.log('[WorkerManager] Sending request:', { id, lineNumber, textLength: text.length });
      
      // Store promise handlers
      this.pendingRequests.set(id, { resolve, reject });

      // Send request to worker
      const request: WorkerRequest = {
        id,
        type: 'process-line',
        text,
        lineNumber,
      };

      try {
        this.worker.postMessage(request);
      } catch (error) {
        console.error('[WorkerManager] Failed to send message:', error);
        this.pendingRequests.delete(id);
        reject(error instanceof Error ? error : new Error('Failed to send message to worker'));
      }
    });
  }

  /**
   * Handle response from worker
   */
  private handleResponse(response: WorkerResponse): void {
    console.log('[WorkerManager] Received response:', { id: response.id, type: response.type, hasData: !!response.data, hasError: !!response.error });
    
    const pending = this.pendingRequests.get(response.id);
    
    if (!pending) {
      console.warn('[WorkerManager] Received response for unknown request:', response.id);
      return;
    }

    this.pendingRequests.delete(response.id);

    if (response.type === 'error') {
      pending.reject(new Error(response.error || 'Unknown worker error'));
    } else if (response.type === 'line-result' && response.data) {
      pending.resolve(response.data);
    } else {
      pending.reject(new Error('Invalid response from worker'));
    }
  }

  /**
   * Terminate the worker and clean up
   */
  terminate(): void {
    this.worker.terminate();
    
    // Reject all pending requests
    this.pendingRequests.forEach(({ reject }) => {
      reject(new Error('Worker was terminated'));
    });
    this.pendingRequests.clear();
  }

  /**
   * Get the number of pending requests
   */
  getPendingCount(): number {
    return this.pendingRequests.size;
  }
}

// Export singleton instance
let workerManagerInstance: WorkerManager | null = null;

/**
 * Get or create the singleton worker manager instance
 */
export function getWorkerManager(): WorkerManager {
  if (!workerManagerInstance) {
    workerManagerInstance = new WorkerManager();
  }
  return workerManagerInstance;
}

/**
 * Clean up the worker manager (useful for hot module replacement)
 */
export function cleanupWorkerManager(): void {
  if (workerManagerInstance) {
    workerManagerInstance.terminate();
    workerManagerInstance = null;
  }
}
